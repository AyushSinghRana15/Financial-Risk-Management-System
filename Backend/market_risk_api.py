import pandas as pd
import joblib
from fastapi import APIRouter

router = APIRouter()

# ----------------------------
# LOAD MARKET RISK MODEL
# ----------------------------

model_package = joblib.load("../Models/ml_var_model.pkl")

model = model_package["model"]
features = model_package["features"]
residual_var = model_package["residual_var"]

# ----------------------------
# FEATURE NAME CLEANING
# ----------------------------

def clean_feature_name(feature):

    feature_map = {
        "^NSEI": "NIFTY 50",
        "^INDIAVIX": "India VIX",
        "^DJI": "Dow Jones Industrial Average",
        "^GSPC": "S&P 500",
        "^IXIC": "NASDAQ Composite",
        "^FTSE": "FTSE 100",
        "^N225": "Nikkei 225",
        "^HSI": "Hang Seng Index",
        "^BSESN": "Sensex",
        "GC=F": "Gold Futures",
        "CL=F": "Crude Oil Futures",
        "SI=F": "Silver Futures",
        "DX-Y.NYB": "US Dollar Index",
        "INR=X": "USD/INR Exchange Rate",
        "EURUSD=X": "EUR/USD Exchange Rate"
    }

    if feature in feature_map:
        return feature_map[feature]

    # fallback formatting
    name = feature.replace("^", "")
    name = name.replace("_", " ")
    return name.title()


# ----------------------------
# GET MARKET FEATURES
# ----------------------------

@router.get("/market_features")
def get_market_features():

    cleaned_labels = [clean_feature_name(f) for f in features]

    return {
        "features": features,
        "labels": cleaned_labels
    }


# ----------------------------
# MARKET RISK PREDICTION
# ----------------------------

@router.post("/predict_market_risk")
def predict_market_risk(data: dict):

    confidence = data.get("confidence", "95%")

    input_values = []

    for feature in features:
        input_values.append(data.get(feature, 0))

    input_df = pd.DataFrame([input_values], columns=features)

    prediction = model.predict(input_df)[0]

    # Add residual variance
    var_prediction = prediction + residual_var

    # ----------------------------
    # RISK CLASSIFICATION
    # ----------------------------

    if var_prediction > 0.05:
        risk_level = "High Market Risk"

    elif var_prediction > 0.02:
        risk_level = "Moderate Market Risk"

    else:
        risk_level = "Low Market Risk"

    # ----------------------------
    # RESPONSE
    # ----------------------------

    return {
        "predicted_var": float(var_prediction),
        "residual_variance": float(residual_var),
        "confidence_level": confidence,
        "risk_level": risk_level
    }