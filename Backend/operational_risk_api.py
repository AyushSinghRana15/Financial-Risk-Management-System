from fastapi import APIRouter
import pandas as pd
import numpy as np
import joblib
import json
import os

router = APIRouter()

# -------------------------
# Load Model & Features
# -------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "../Models/operational_model.pkl"))

with open(os.path.join(BASE_DIR, "../Models/operational_features.json")) as f:
    feature_names = json.load(f)

# -------------------------
# Operational Risk API
# -------------------------

@router.post("/predict_operational_risk")
def predict_operational_risk(data: dict):

    try:
        # -------------------------
        # Extract Inputs
        # -------------------------

        reassignment_count = data.get("reassignment_count", 0)
        reopen_count = data.get("reopen_count", 0)
        sys_mod_count = data.get("sys_mod_count", 0)

        active = data.get("active", "No")
        made_sla = data.get("made_sla", "No")

        # -------------------------
        # Encoding
        # -------------------------

        active = 1 if active == "Yes" else 0
        made_sla = 1 if made_sla == "Yes" else 0

        # -------------------------
        # Feature Engineering
        # -------------------------

        incident_complexity = reassignment_count + reopen_count + sys_mod_count
        reopen_ratio = reopen_count / (sys_mod_count + 1)

        # -------------------------
        # Create DataFrame
        # -------------------------

        input_data = pd.DataFrame([[
            reassignment_count,
            reopen_count,
            sys_mod_count,
            incident_complexity,
            reopen_ratio,
            active,
            made_sla
        ]], columns=feature_names)

        # -------------------------
        # Prediction
        # -------------------------

        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]

        # -------------------------
        # Risk Labels
        # -------------------------

        risk_labels = {
            0: "Low Risk",
            1: "Medium Risk",
            2: "High Risk"
        }

        risk = risk_labels.get(prediction, "Unknown")

        # -------------------------
        # Response
        # -------------------------

        return {
            "prediction": int(prediction),
            "risk_level": risk,
            "probabilities": {
                "low": float(probabilities[0]),
                "medium": float(probabilities[1]),
                "high": float(probabilities[2])
            }
        }

    except Exception as e:
        return {"error": str(e)}
    