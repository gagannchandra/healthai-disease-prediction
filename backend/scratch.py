import pandas as pd
import json
import ast
import os

base_dir = '/home/gagan-chandra/code/Disease Prediction System/backend/dataset'

def load_and_parse(filename):
    path = os.path.join(base_dir, filename)
    if not os.path.exists(path): return pd.DataFrame()
    return pd.read_csv(path)

desc = load_and_parse('description.csv')
diets = load_and_parse('diets.csv')
meds = load_and_parse('medications.csv')
prec = load_and_parse('precautions.csv')
work = load_and_parse('workout.csv')

def parse_list_string(s):
    if pd.isna(s): return []
    try:
        return ast.literal_eval(s)
    except:
        return [str(s)]

disease_info = {}

# We'll normalize the disease names
def norm(d):
    if pd.isna(d): return ""
    return str(d).strip().lower()

all_diseases = set()
for df in [desc, diets, meds, prec, work]:
    if not df.empty and 'Disease' in df.columns:
        all_diseases.update([norm(d) for d in df['Disease']])

for d in all_diseases:
    if not d: continue
    disease_info[d] = {
        'description': '',
        'diets': [],
        'medications': [],
        'precautions': [],
        'workouts': []
    }

if not desc.empty:
    for _, row in desc.iterrows():
        d = norm(row.get('Disease'))
        if d: disease_info[d]['description'] = str(row.get('Description', ''))

if not diets.empty:
    for _, row in diets.iterrows():
        d = norm(row.get('Disease'))
        if d: disease_info[d]['diets'] = parse_list_string(row.get('Diet'))

if not meds.empty:
    for _, row in meds.iterrows():
        d = norm(row.get('Disease'))
        if d: disease_info[d]['medications'] = parse_list_string(row.get('Medication'))

if not prec.empty:
    for _, row in prec.iterrows():
        d = norm(row.get('Disease'))
        if d:
            p1 = row.get('Precaution_1')
            p2 = row.get('Precaution_2')
            p3 = row.get('Precaution_3')
            p4 = row.get('Precaution_4')
            disease_info[d]['precautions'] = [str(x) for x in [p1, p2, p3, p4] if pd.notna(x)]

if not work.empty:
    for _, row in work.iterrows():
        d = norm(row.get('Disease'))
        if d: 
            val = row.get('Workouts')
            if pd.isna(val): continue
            try:
                disease_info[d]['workouts'] = ast.literal_eval(val)
            except:
                disease_info[d]['workouts'] = [val]

print("Parsed diseases:", len(disease_info.keys()))
print("Example info for 'asthma':")
print(json.dumps(disease_info.get('asthma'), indent=2))
