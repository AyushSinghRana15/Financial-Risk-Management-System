from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import json

router = APIRouter()

# -------------------------
# Load model + features
# -------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "Models", "operational_risk.pkl"))

with open(os.path.join(BASE_DIR, "Models", "operational_features.json")) as f:
    feature_data = json.load(f)

if isinstance(feature_data, dict):
    feature_names = feature_data.get("features", [])
else:
    feature_names = feature_data

# -------------------------
# Input Schema
# -------------------------

class OperationalRiskInput(BaseModel):
    reassignment_count: int
    reopen_count: int
    sys_mod_count: int
    active: str
    made_sla: str

# -------------------------
# Prediction API
# -------------------------

@router.post("/predict_operational_risk")
def predict(data: OperationalRiskInput):

    try:
        # Extract inputs
        reassignment_count = data.reassignment_count
        reopen_count = data.reopen_count
        sys_mod_count = data.sys_mod_count

        active = 1 if data.active == "Yes" else 0
        made_sla = 1 if data.made_sla == "Yes" else 0

        # Feature Engineering
        incident_complexity = reassignment_count + reopen_count + sys_mod_count
        reopen_ratio = reopen_count / (sys_mod_count + 1)

        # Create DataFrame
        input_data = pd.DataFrame([[
            reassignment_count,
            reopen_count,
            sys_mod_count,
            incident_complexity,
            reopen_ratio,
            active,
            made_sla
        ]], columns=feature_names)

        # Prediction
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]

        return {
            "prediction": int(prediction),
            "risk_level": "High Risk" if prediction == 1 else "Low Risk",
            "probabilities": {
                "low": float(probabilities[0]),
                "medium": float(probabilities[1]) if len(probabilities) > 2 else 0,
                "high": float(probabilities[-1])
            }
        }

    except Exception as e:
        return {"error": str(e)}
