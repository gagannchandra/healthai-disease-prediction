import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(base_dir, 'models')
disease_info_path = os.path.join(models_dir, 'disease_info.json')

_disease_info_cache = None

def _load_disease_info():
    global _disease_info_cache
    if _disease_info_cache is None:
        if os.path.exists(disease_info_path):
            try:
                with open(disease_info_path, 'r') as f:
                    _disease_info_cache = json.load(f)
            except Exception as e:
                print(f"Error loading disease_info.json: {e}")
                _disease_info_cache = {}
        else:
            _disease_info_cache = {}
    return _disease_info_cache

def get_disease_details(disease_name):
    disease_info = _load_disease_info()
    norm_name = str(disease_name).strip().lower()
    
    if norm_name in disease_info:
        return disease_info[norm_name]
        
    # Attempt substring matching for differently named diseases (e.g. 'Bronchial Asthma' -> 'asthma')
    # or ('Dimorphic hemmorhoids(piles)' -> 'hemorrhoids')
    for key in disease_info.keys():
        if key in norm_name or norm_name in key:
            return disease_info[key]
            
    # Hardcoded aliases for tricky mismatches
    aliases = {
        'peptic ulcer diseae': 'esophagitis', # Fallback for GI-related
        'osteoarthristis': 'arthritis of the hip',
        'dimorphic hemmorhoids(piles)': 'hemorrhoids'
    }
    
    if norm_name in aliases and aliases[norm_name] in disease_info:
        return disease_info[aliases[norm_name]]

    return {
        'description': 'Information not available.',
        'diets': [],
        'medications': [],
        'precautions': [],
        'workouts': []
    }

# Mapping diseases to doctor specializations and explanations
doctor_mapping = {
    'fungal infection': {'specialist': 'Dermatologist', 'reason': 'Treats skin, hair, and nail conditions.'},
    'allergy': {'specialist': 'Allergist/Immunologist', 'reason': 'Specializes in allergic diseases and immune system issues.'},
    'gerd': {'specialist': 'Gastroenterologist', 'reason': 'Treats digestive system and gastrointestinal tract disorders.'},
    'chronic cholestasis': {'specialist': 'Hepatologist/Gastroenterologist', 'reason': 'Specializes in liver and biliary system diseases.'},
    'drug reaction': {'specialist': 'Allergist/Dermatologist', 'reason': 'Deals with allergic reactions and skin manifestations.'},
    'peptic ulcer diseae': {'specialist': 'Gastroenterologist', 'reason': 'Treats ulcers in the stomach and digestive tract.'},
    'aids': {'specialist': 'Infectious Disease Specialist', 'reason': 'Manages severe infections and immune deficiencies.'},
    'diabetes': {'specialist': 'Endocrinologist', 'reason': 'Treats hormone-related diseases including diabetes.'},
    'gastroenteritis': {'specialist': 'Gastroenterologist/General Physician', 'reason': 'Treats stomach and intestinal infections.'},
    'bronchial asthma': {'specialist': 'Pulmonologist', 'reason': 'Treats respiratory system and lung conditions.'},
    'hypertension': {'specialist': 'Cardiologist/General Physician', 'reason': 'Manages high blood pressure and heart health.'},
    'migraine': {'specialist': 'Neurologist', 'reason': 'Treats nervous system disorders including severe headaches.'},
    'cervical spondylosis': {'specialist': 'Orthopedist/Neurologist', 'reason': 'Treats bone, joint, and nerve issues in the neck.'},
    'paralysis (brain hemorrhage)': {'specialist': 'Neurologist', 'reason': 'Specializes in brain and nervous system critical care.'},
    'jaundice': {'specialist': 'Hepatologist/Gastroenterologist', 'reason': 'Treats liver conditions causing jaundice.'},
    'malaria': {'specialist': 'General Physician/Infectious Disease Specialist', 'reason': 'Treats infectious and mosquito-borne diseases.'},
    'chicken pox': {'specialist': 'General Physician/Dermatologist', 'reason': 'Treats common viral infections with skin rashes.'},
    'dengue': {'specialist': 'General Physician', 'reason': 'Manages viral fevers and complications.'},
    'typhoid': {'specialist': 'General Physician', 'reason': 'Treats bacterial infections causing prolonged fever.'},
    'hepatitis a': {'specialist': 'Hepatologist', 'reason': 'Specializes in liver inflammation and diseases.'},
    'hepatitis b': {'specialist': 'Hepatologist', 'reason': 'Specializes in liver inflammation and diseases.'},
    'hepatitis c': {'specialist': 'Hepatologist', 'reason': 'Specializes in liver inflammation and diseases.'},
    'hepatitis d': {'specialist': 'Hepatologist', 'reason': 'Specializes in liver inflammation and diseases.'},
    'hepatitis e': {'specialist': 'Hepatologist', 'reason': 'Specializes in liver inflammation and diseases.'},
    'alcoholic hepatitis': {'specialist': 'Hepatologist', 'reason': 'Treats liver damage caused by alcohol.'},
    'tuberculosis': {'specialist': 'Pulmonologist/Infectious Disease Specialist', 'reason': 'Treats lung infections and chronic diseases.'},
    'common cold': {'specialist': 'General Physician', 'reason': 'Treats mild respiratory infections.'},
    'pneumonia': {'specialist': 'Pulmonologist', 'reason': 'Treats severe lung infections.'},
    'dimorphic hemmorhoids(piles)': {'specialist': 'Proctologist/Gastroenterologist', 'reason': 'Treats disorders of the rectum and anus.'},
    'heart attack': {'specialist': 'Cardiologist', 'reason': 'Treats heart and cardiovascular emergencies.'},
    'varicose veins': {'specialist': 'Vascular Surgeon', 'reason': 'Treats blood vessel and vein conditions.'},
    'hypothyroidism': {'specialist': 'Endocrinologist', 'reason': 'Treats thyroid hormone deficiencies.'},
    'hyperthyroidism': {'specialist': 'Endocrinologist', 'reason': 'Treats overactive thyroid conditions.'},
    'hypoglycemia': {'specialist': 'Endocrinologist/General Physician', 'reason': 'Manages blood sugar abnormalities.'},
    'osteoarthristis': {'specialist': 'Rheumatologist/Orthopedist', 'reason': 'Treats joint inflammation and bone wear.'},
    'arthritis': {'specialist': 'Rheumatologist', 'reason': 'Treats immune and inflammatory joint conditions.'},
    '(vertigo) paroymsal  positional vertigo': {'specialist': 'ENT Specialist/Neurologist', 'reason': 'Treats inner ear and balance disorders.'},
    'acne': {'specialist': 'Dermatologist', 'reason': 'Treats skin conditions including acne.'},
    'urinary tract infection': {'specialist': 'Urologist/Gynecologist', 'reason': 'Treats urinary system infections.'},
    'psoriasis': {'specialist': 'Dermatologist', 'reason': 'Treats autoimmune skin conditions.'},
    'impetigo': {'specialist': 'Dermatologist/Pediatrician', 'reason': 'Treats highly contagious skin infections.'}
}

def get_doctor_recommendation(disease):
    norm_name = str(disease).strip().lower()
    return doctor_mapping.get(norm_name, {'specialist': 'General Physician', 'reason': 'For general consultation and proper routing.'})

# Simple Rule-based Chatbot Logic
def get_chat_response(message):
    message = message.lower()
    if 'headache' in message:
        return "Headaches can be caused by stress, dehydration, or lack of sleep. Ensure you are well hydrated. If it persists, please use our symptom checker."
    elif 'fever' in message:
        return "Fever is often a sign of an infection. Rest and drink plenty of fluids. You can take paracetamol for temporary relief. If it exceeds 102°F or lasts more than 3 days, consult a doctor."
    elif 'stomach' in message or 'pain' in message and 'belly' in message:
        return "Stomach pain can result from indigestion, food poisoning, or infections. Eat light, bland food. If pain is severe, seek medical help immediately."
    elif 'hello' in message or 'hi' in message:
        return "Hello! I am your Health Assistant. You can tell me your symptoms or ask basic health queries."
    else:
        return "I am a basic health bot. For accurate analysis, please go to the 'Symptom Checker' page and select your specific symptoms for our ML models to predict potential conditions."
