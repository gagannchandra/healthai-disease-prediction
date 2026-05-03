import json
import difflib

d = json.load(open('models/disease_info.json'))
keys = list(d.keys())

tests = ["Fungal infection", "Bronchial Asthma", "Peptic ulcer diseae", "Dimorphic hemmorhoids(piles)", "Osteoarthristis", "Acne"]

for t in tests:
    norm_t = str(t).strip().lower()
    
    # Try exact match
    if norm_t in keys:
        print(f"'{t}' -> exact match '{norm_t}'")
        continue
        
    # Try finding substring match
    substring_match = next((k for k in keys if k in norm_t or norm_t in k), None)
    if substring_match:
        print(f"'{t}' -> substring match '{substring_match}'")
        continue
        
    # Try difflib close matches
    close_matches = difflib.get_close_matches(norm_t, keys, n=1, cutoff=0.6)
    if close_matches:
        print(f"'{t}' -> fuzzy match '{close_matches[0]}'")
        continue
        
    print(f"'{t}' -> NO MATCH")
