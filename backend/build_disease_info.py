"""Build models/disease_info.json: description, diets, medications, precautions and
workouts for each disease the model can predict.

Sources, in order of precedence:
  1. dataset/{description,diets,medications,precautions,workout}.csv
     (the 100 diseases of Diseases_and_Symptoms_dataset.csv)
  2. dataset/medicine_recommendation/  (the 41 diseases of disease_dataset.csv; see SOURCE.md)
     Only used for diseases that source 1 does not cover. Known defects in this
     source are corrected below.

Run directly (`python build_disease_info.py`) or via train.py.
"""
import ast
import json
import os
import re

import pandas as pd

from data_rules import disease_key

base_dir = os.path.dirname(os.path.abspath(__file__))
dataset_dir = os.path.join(base_dir, 'dataset')
mrs_dir = os.path.join(dataset_dir, 'medicine_recommendation')

# medications.csv in the Medicine Recommendation dataset is shifted by one row
# from "Chicken pox" onwards: each row holds the list for the NEXT disease.
# Map each disease to the source row that actually describes it.
MRS_MEDICATION_SOURCE_ROW = {
    'dengue': 'chicken pox',
    'typhoid': 'dengue',
    'hepatitis a': 'typhoid',
    'hepatitis b': 'hepatitis a',
    'hepatitis c': 'hepatitis b',
    'hepatitis d': 'hepatitis c',
    'hepatitis e': 'hepatitis d',
    'alcoholic hepatitis': 'hepatitis e',
    'tuberculosis': 'alcoholic hepatitis',
    'common cold': 'tuberculosis',
    'pneumonia': 'common cold',
    'hemorrhoids': 'pneumonia',
    'heart attack': 'hemorrhoids',
    'varicose veins': 'heart attack',
    'hypothyroidism': 'varicose veins',
    'hyperthyroidism': 'hypothyroidism',
    'hypoglycemia': 'hyperthyroidism',
    'osteoarthritis': 'hypoglycemia',
    'arthritis': 'osteoarthritis',
    'benign paroxysmal positional vertigo': 'arthritis',
    'acne': 'benign paroxysmal positional vertigo',
    'chicken pox': None,  # its list was lost in the shift
}
# Corrections to the re-aligned lists (see SOURCE.md).
MRS_MEDICATION_OVERRIDES = {
    'hypothyroidism': ['Levothyroxine'],
    'dengue': ['Paracetamol (avoid aspirin/NSAIDs)', 'IV fluids', 'Blood transfusions', 'Platelet transfusions'],
    # Source lists blood thinners / clot-dissolving drugs, which are contraindicated for a brain bleed.
    'paralysis (brain hemorrhage)': ['Anticonvulsants', 'Physical therapy', 'Occupational therapy'],
}
MRS_SPELLING_FIXES = {
    'asprin': 'aspirin', 'antiboitic': 'antibiotic', 'detol': 'dettol', 'poloroid': 'polaroid',
    'cloothing': 'clothing', 'movment': 'movement', 'oinments': 'ointments', 'dont': "don't",
    'vegitables': 'vegetables', 'reliver': 'reliever', 'fiberous': 'fibrous', 'alovera': 'aloe vera',
    'mosquitos': 'mosquitoes', 'wash hands through': 'wash hands thoroughly', 'osteoarthristis': 'osteoarthritis',
}


def parse_list_string(s):
    if pd.isna(s):
        return []
    try:
        return list(ast.literal_eval(s))
    except (ValueError, SyntaxError):
        return [str(s)]


def tidy(text):
    text = re.sub(r'\s+', ' ', str(text)).strip()
    for wrong, right in MRS_SPELLING_FIXES.items():
        text = re.sub(rf'\b{re.escape(wrong)}\b', right, text, flags=re.IGNORECASE)
    return text[:1].upper() + text[1:]


def empty_profile():
    return {'description': '', 'diets': [], 'medications': [], 'precautions': [], 'workouts': []}


def read_csv(*parts):
    path = os.path.join(*parts)
    return pd.read_csv(path) if os.path.exists(path) else pd.DataFrame()


def load_main_source():
    info = {}

    def rows(filename):
        df = read_csv(dataset_dir, filename)
        for _, row in df.iterrows():
            if pd.notna(row.get('Disease')):
                yield info.setdefault(disease_key(row['Disease']), empty_profile()), row

    for p, row in rows('description.csv'):
        p['description'] = str(row.get('Description', ''))
    for p, row in rows('diets.csv'):
        p['diets'] = parse_list_string(row.get('Diet'))
    for p, row in rows('medications.csv'):
        p['medications'] = parse_list_string(row.get('Medication'))
    for p, row in rows('precautions.csv'):
        p['precautions'] = [str(row[f'Precaution_{i}']) for i in range(1, 5) if pd.notna(row.get(f'Precaution_{i}'))]
    for p, row in rows('workout.csv'):
        p['workouts'] = parse_list_string(row.get('Workouts'))
    return info


def load_medicine_recommendation_source():
    info = {}

    def profile(name):
        return info.setdefault(disease_key(name), empty_profile())

    for _, row in read_csv(mrs_dir, 'description.csv').iterrows():
        profile(row['Disease'])['description'] = tidy(row['Description'])
    for _, row in read_csv(mrs_dir, 'diets.csv').iterrows():
        profile(row['Disease'])['diets'] = parse_list_string(row['Diet'])
    for _, row in read_csv(mrs_dir, 'precautions_df.csv').iterrows():
        profile(row['Disease'])['precautions'] = [
            tidy(row[f'Precaution_{i}']) for i in range(1, 5) if pd.notna(row.get(f'Precaution_{i}'))]
    workouts = read_csv(mrs_dir, 'workout_df.csv')
    for name, group in workouts.groupby('disease', sort=False):
        profile(name)['workouts'] = [tidy(w) for w in group['workout']]

    raw_meds = {disease_key(r['Disease']): parse_list_string(r['Medication'])
                for _, r in read_csv(mrs_dir, 'medications.csv').iterrows()}
    for key in raw_meds:
        source_row = MRS_MEDICATION_SOURCE_ROW.get(key, key)
        meds = MRS_MEDICATION_OVERRIDES.get(key, raw_meds.get(source_row, []) if source_row else [])
        profile(key)['medications'] = meds
    return info


def build(output_path):
    info = load_main_source()
    added = 0
    for key, profile in load_medicine_recommendation_source().items():
        if key not in info:
            info[key] = profile
            added += 1
    with open(output_path, 'w') as f:
        json.dump(info, f, indent=2)
    print(f"Saved disease_info.json with {len(info)} entries ({added} from the Medicine Recommendation dataset).")
    return info


if __name__ == '__main__':
    build(os.path.join(base_dir, 'models', 'disease_info.json'))
