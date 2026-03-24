from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import joblib
import os

router = APIRouter()

# -------------------------
# Load model + features
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "Models", "operational_risk_model.pkl"))
feature_names = joblib.load(os.path.join(BASE_DIR, "Models", "operational_features.pkl"))

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
        # Extract
        reassignment_count = data.reassignment_count
        reopen_count = data.reopen_count
        sys_mod_count = data.sys_mod_count
        active = data.active
        made_sla = data.made_sla

        # Encoding
        active = 1 if active == "Yes" else 0
        made_sla = 1 if made_sla == "Yes" else 0

        # Feature Engineering
        incident_complexity = reassignment_count + reopen_count + sys_mod_count
        reopen_ratio = reopen_count / (sys_mod_count + 1)

        # DataFrame
        input_df = pd.DataFrame([[
            reassignment_count,
            reopen_count,
            sys_mod_count,
            incident_complexity,
            reopen_ratio,
            active,
            made_sla
        ]], columns=feature_names)

        # Prediction
        prediction = model.predict(input_df)[0]
        probabilities = model.predict_proba(input_df)[0]

        risk = "High Risk" if prediction == 1 else "Low Risk"

        return {
            "prediction": int(prediction),
            "risk_level": risk,
            "probabilities": {
                "low": float(probabilities[0]),
                "high": float(probabilities[1])
            }
        }

    except Exception as e:
        return {"error": str(e)}
