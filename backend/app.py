from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import os


from disease_logic import get_doctor_recommendation, get_chat_response, get_disease_details
from xgboost import XGBClassifier, XGBRFClassifier
from sklearn.preprocessing import LabelEncoder

class XGBWrapper:
    def __init__(self, model_type='rf', **kwargs):
        if 'device' not in kwargs:
            kwargs['device'] = os.getenv('DEVICE', 'cpu')
        if model_type == 'rf':
            self.model = XGBRFClassifier(**kwargs)
        else:
            self.model = XGBClassifier(**kwargs)
        self.encoder = LabelEncoder()
        
    def fit(self, X, y):
        y_encoded = self.encoder.fit_transform(y)
        self.classes_ = self.encoder.classes_
        self.model.fit(X, y_encoded)
        return self
        
    def predict(self, X):
        preds = self.model.predict(X)
        return self.encoder.inverse_transform(preds)
        
    def predict_proba(self, X):
        return self.model.predict_proba(X)
        
    def get_depth(self):
        return getattr(self.model, 'max_depth', 0)
        
    def get_n_leaves(self):
        return 0
        
    @property
    def n_estimators(self):
        return getattr(self.model, 'n_estimators', 1)
        
    @property
    def estimators_(self):
        class MockTree:
            def __init__(self, depth):
                self.max_depth = depth
        class MockEstimator:
            def __init__(self, depth):
                self.tree_ = MockTree(depth)
        return [MockEstimator(self.get_depth())]

import __main__
__main__.XGBWrapper = XGBWrapper

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
    dt_model = joblib.load(os.path.join(models_dir, 'dt_model.joblib'))
    rf_model = joblib.load(os.path.join(models_dir, 'rf_model.joblib'))
    nb_model = joblib.load(os.path.join(models_dir, 'nb_model.joblib'))
    symptoms_list = joblib.load(os.path.join(models_dir, 'symptoms_list.joblib'))
    diseases_list = joblib.load(os.path.join(models_dir, 'diseases_list.joblib'))
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models. Did you run train.py? Error: {e}")
    # Initialize empty defaults for graceful startup failure reporting
    dt_model = rf_model = nb_model = None
    symptoms_list = []
    diseases_list = []

class SymptomInput(BaseModel):
    symptoms: List[str]

class ChatInput(BaseModel):
    message: str

@app.get("/")
def root():
    return {"status": "HealthAI backend is running"}


@app.get("/api/symptoms")
def get_symptoms():
    if not symptoms_list:
        raise HTTPException(status_code=500, detail="Symptoms list not loaded.")
    # Return formatted symptom names (replace underscores with spaces)

    # Mapping to keep track of original keys
    return {"symptoms": [{"id": s, "name": s.replace('_', ' ').title()} for s in symptoms_list]}

@app.post("/api/predict")
def predict_disease(input_data: SymptomInput):
    if not input_data.symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided.")
        
    if dt_model is None or rf_model is None or nb_model is None:
        raise HTTPException(status_code=500, detail="Models are not loaded.")

    # Create input vector
    input_vector = np.zeros(len(symptoms_list))
    for symptom in input_data.symptoms:
        if symptom in symptoms_list:
            index = symptoms_list.index(symptom)
            input_vector[index] = 1

    input_vector = input_vector.reshape(1, -1)

    # Predictions
    dt_pred = dt_model.predict(input_vector)[0]
    rf_pred = rf_model.predict(input_vector)[0]
    nb_pred = nb_model.predict(input_vector)[0]

    # Get probabilities to determine confidence
    rf_probs = rf_model.predict_proba(input_vector)[0]
    nb_probs = nb_model.predict_proba(input_vector)[0]
    dt_probs = dt_model.predict_proba(input_vector)[0]

    # Combine probabilities for a final ensemble score
    avg_probs = (rf_probs + nb_probs + dt_probs) / 3
    
    # Get top 3 indices
    top_3_indices = np.argsort(avg_probs)[-3:][::-1]
    
    top_3_diseases = []
    for idx in top_3_indices:
        if avg_probs[idx] > 0:
            top_3_diseases.append({
                "disease": dt_model.classes_[idx], # classes should be same across models
                "confidence": round(float(avg_probs[idx]) * 100, 2)
            })

    # The most likely disease based on voting (if models disagree, take the highest average probability)
    final_prediction = top_3_diseases[0]['disease']
    confidence = top_3_diseases[0]['confidence']

    doctor_info = get_doctor_recommendation(final_prediction)
    disease_details = get_disease_details(final_prediction)

    return {
        "final_prediction": final_prediction,
        "confidence": confidence,
        "top_3": top_3_diseases,
        "model_predictions": {
            "Random Forest": rf_pred,
            "Decision Tree": dt_pred,
            "Naive Bayes": nb_pred
        },
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
