"""Data-cleaning rules shared by train.py and build_disease_info.py.

The two source datasets were built independently: dataset A (41 diseases,
snake_case symptom names) and dataset B (100 diseases, plain-English names).
The rules below fix typos and connect the two vocabularies so that a symptom
selected by the user reaches diseases from both datasets.
"""
import re

# Columns merged into one (logical OR): typo fixes, a duplicated column in
# dataset B, and dataset-A symptoms that are exact synonyms of a dataset-B one.
SYMPTOM_RENAMES = {
    'regurgitation_1': 'regurgitation',
    'scurring': 'scarring',
    'cold_hands_and_feets': 'cold_hands_and_feet',
    'swollen_extremeties': 'swollen_extremities',
    'toxic_look_typhos': 'toxic_look',
    'diarrhoea': 'diarrhea',
    'breathlessness': 'shortness_of_breath',
    'runny_nose': 'coryza',
    'burning_micturition': 'painful_urination',
    'bloody_stool': 'blood_in_stool',
    'blood_in_sputum': 'hemoptysis',
    'fast_heart_rate': 'increased_heart_rate',
    'loss_of_appetite': 'decreased_appetite',
    'redness_of_eyes': 'eye_redness',
    'watering_from_eyes': 'lacrimation',
    'hip_joint_pain': 'hip_pain',
    'pain_in_anal_region': 'pain_of_the_anus',
    'swollen_legs': 'leg_swelling',
    'polyuria': 'frequent_urination',
    'anxiety': 'anxiety_and_nervousness',
    'malaise': 'feeling_ill',
    'itching': 'itching_of_skin',
    'cramps': 'cramps_and_spasms',
}

# A specific symptom also implies a more general one. Both columns are kept, so
# the specific information is not lost; the API applies the same rules.
SYMPTOM_IMPLIES = {
    'high_fever': 'fever',
    'mild_fever': 'fever',
    'continuous_sneezing': 'sneezing',
    'congestion': 'nasal_congestion',
    'yellowish_skin': 'jaundice',
    'yellowing_of_eyes': 'jaundice',
    'muscle_weakness': 'weakness',
    'weakness_in_limbs': 'weakness',
    'skin_peeling': 'skin_dryness_peeling_scaliness_or_roughness',
    'phlegm': 'coughing_up_sputum',
    'mucoid_sputum': 'coughing_up_sputum',
    'rusty_sputum': 'coughing_up_sputum',
    'acidity': 'heartburn',
    'blurred_and_distorted_vision': 'diminished_vision',
    'visual_disturbances': 'diminished_vision',
    'pus_filled_pimples': 'acne_or_pimples',
    'blackheads': 'acne_or_pimples',
    'throat_irritation': 'sore_throat',
    'sinus_pressure': 'painful_sinuses',
    'slurred_speech': 'difficulty_speaking',
    'weakness_of_one_body_half': 'focal_weakness',
    'irritation_in_anus': 'itching_of_the_anus',
}

SYMPTOM_DISPLAY_OVERRIDES = {
    'coryza': 'Runny nose (coryza)',
    'hemoptysis': 'Coughing up blood (hemoptysis)',
    'lacrimation': 'Watery eyes (lacrimation)',
    'melena': 'Black, tarry stool (melena)',
    'paresthesia': 'Tingling or numbness (paresthesia)',
    'apnea': 'Pauses in breathing (apnea)',
    'feeling_ill': 'Feeling ill (malaise)',
    'painful_urination': 'Painful or burning urination',
    'toxic_look': 'Toxic look (typhos)',
    'scarring': 'Scarring',
    'dischromic_patches': 'Dyschromic (discoloured) skin patches',
}

# Typo fixes, and dataset-A diseases that are the same disease as a dataset-B class.
DISEASE_RENAMES = {
    'peptic ulcer diseae': 'peptic ulcer disease',
    'osteoarthristis': 'osteoarthritis',
    '(vertigo) paroymsal positional vertigo': 'benign paroxysmal positional vertigo',
    'dimorphic hemmorhoids(piles)': 'hemorrhoids',
    'bronchial asthma': 'asthma',
}
DISEASE_DISPLAY_OVERRIDES = {
    'benign paroxysmal positional vertigo': 'Benign paroxysmal positional vertigo (BPPV)',
    'hemorrhoids': 'Hemorrhoids (piles)',
}


def symptom_id(name):
    return re.sub(r'[^a-z0-9]+', '_', str(name).strip().lower()).strip('_')


def disease_key(name):
    """Canonical class key for a disease name from any source file."""
    key = re.sub(r'\s+', ' ', str(name).strip().lower())
    return DISEASE_RENAMES.get(key, key)
