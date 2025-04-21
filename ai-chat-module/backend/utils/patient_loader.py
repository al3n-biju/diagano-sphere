import json
import os

def load_patient_profile(case_id):
    path = os.path.join(os.path.dirname(__file__), '../patient_profiles/profiles.json')
    with open(path, 'r') as f:
        profiles = json.load(f)
    return profiles.get(case_id.lower())
  
