from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import json
import joblib
import numpy as np
import os
import re


from disease_logic import get_doctor_recommendation, get_chat_response, get_disease_details, is_urgent

app = FastAPI(title="Disease Prediction API", version="1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models and data
base_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(base_dir, 'models')

try:
    with open(os.path.join(models_dir, 'model_config.json')) as f:
        model_config = json.load(f)
    models = {name: joblib.load(os.path.join(models_dir, fname))
              for name, fname in model_config['models'].items()}
    ensemble_weights = model_config['weights']
    display_names = model_config['display_names']
    symptom_names = model_config.get('symptom_names', {})
    symptom_aliases = model_config.get('symptom_aliases', {})
    symptom_implications = model_config.get('symptom_implications', {})
    symptoms_list = joblib.load(os.path.join(models_dir, 'symptoms_list.joblib'))
    diseases_list = joblib.load(os.path.join(models_dir, 'diseases_list.joblib'))
    symptom_index = {s: i for i, s in enumerate(symptoms_list)}
    classes = next(iter(models.values())).classes_
    if any(list(m.classes_) != list(classes) for m in models.values()):
        raise ValueError("Models were trained with different class orderings.")
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models. Did you run train.py? Error: {e}")
    models = {}
    symptoms_list = []
    diseases_list = []


def normalize_symptom(symptom):
    """Map a client symptom id (including legacy ids such as 'diarrhoea') to a model feature."""
    sid = re.sub(r'[^a-z0-9]+', '_', str(symptom).strip().lower()).strip('_')
    return symptom_aliases.get(sid, sid)


def display_name(disease):
    return display_names.get(disease, disease)


class SymptomInput(BaseModel):
    symptoms: List[str]

class ChatInput(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "HealthAI backend is running"}
    
# for uptotime robot
@app.get("/health")
@app.head("/health")
async def health():
    return JSONResponse({"status": "ok"})


@app.get("/api/symptoms")
def get_symptoms():
    if not symptoms_list:
        raise HTTPException(status_code=500, detail="Symptoms list not loaded.")
    # Return formatted symptom names (replace underscores with spaces)

    # Mapping to keep track of original keys
    # Merged synonyms (e.g. "breathlessness" -> shortness_of_breath) stay searchable as aliases.
    aliases = {}
    for old, new in symptom_aliases.items():
        if not any(ch.isdigit() for ch in old):
            aliases.setdefault(new, []).append(old.replace('_', ' '))
    symptoms = [{"id": s, "name": symptom_names.get(s, s.replace('_', ' ').capitalize()), "aliases": aliases.get(s, [])}
                for s in symptoms_list]
    return {"symptoms": sorted(symptoms, key=lambda s: s["name"].lower())}

@app.post("/api/predict")
def predict_disease(input_data: SymptomInput):
    if not input_data.symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided.")
        
    if not models:
        raise HTTPException(status_code=500, detail="Models are not loaded.")

    known = {normalize_symptom(s) for s in input_data.symptoms} & symptom_index.keys()
    unrecognized = [s for s in input_data.symptoms if normalize_symptom(s) not in symptom_index]
    if not known:
        raise HTTPException(status_code=400, detail="None of the provided symptoms are recognized.")
    # Same specific -> general symptom links that train.py applied to the data.
    known |= {symptom_implications[s] for s in known if s in symptom_implications}

    input_vector = np.zeros((1, len(symptoms_list)), dtype=np.float32)
    input_vector[0, [symptom_index[s] for s in known]] = 1

    probs = {name: model.predict_proba(input_vector)[0] for name, model in models.items()}
    # Weighted soft vote; weights are chosen on a validation split by train.py.
    ensemble_probs = sum(ensemble_weights[name] * p for name, p in probs.items())

    top_3_diseases = [
        {"disease": display_name(classes[idx]), "confidence": round(float(ensemble_probs[idx]) * 100, 2),
         "urgent": is_urgent(classes[idx])}
        for idx in np.argsort(ensemble_probs)[::-1][:3]
    ]
    top_class = classes[int(np.argmax(ensemble_probs))]
    final_prediction = display_name(top_class)
    confidence = top_3_diseases[0]['confidence']

    doctor_info = get_doctor_recommendation(top_class)
    disease_details = get_disease_details(top_class)

    return {
        "final_prediction": final_prediction,
        "confidence": confidence,
        "urgent": is_urgent(top_class),
        "top_3": top_3_diseases,
        "model_predictions": {name: display_name(classes[int(np.argmax(p))]) for name, p in probs.items()},
        "unrecognized_symptoms": unrecognized,
        "doctor_recommendation": doctor_info,
        "disease_details": disease_details
    }

@app.post("/api/chat")
def chat(input_data: ChatInput):
    response = get_chat_response(input_data.message)
    return {"reply": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
