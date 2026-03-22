import pandas as pd
import joblib
from fastapi import APIRouter

router = APIRouter()

model = joblib.load("../Models/xgboost_business_risk_model.pkl")
threshold = joblib.load("../Models/business_risk_threshold.pkl")

raw_features = list(model.get_booster().feature_names)
# Use index-based keys to avoid special character issues
feature_keys = [f"feature_{i}" for i in range(len(raw_features))]

@router.get("/business_features")
def get_business_features():
    return {
        "features": feature_keys,
        "labels": raw_features
    }

@router.post("/predict_business_risk")
def predict_business_risk(data: dict):
    input_values = [data.get(f, 0) for f in feature_keys]
    input_df = pd.DataFrame([input_values], columns=raw_features)

    prob = model.predict_proba(input_df)[0][1]
    prediction = 1 if prob >= threshold else 0

    if prob >= 0.75:
        risk_level = "High Business Risk"
    elif prob >= 0.4:
        risk_level = "Moderate Business Risk"
    else:
        risk_level = "Low Business Risk"

    return {
        "risk_probability": round(float(prob), 4),
        "risk_prediction": int(prediction),
        "threshold": float(threshold),
        "risk_level": risk_level
    }