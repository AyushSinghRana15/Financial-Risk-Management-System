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
# MARKET RISK ENDPOINT
# ----------------------------
@router.get("/market_features")
def get_market_features():

    return {
        "features": features
    }
@router.post("/predict_market_risk")
def predict_market_risk(data: dict):

    input_values = []

    for feature in features:
        input_values.append(data.get(feature, 0))

    input_df = pd.DataFrame([input_values], columns=features)

    prediction = model.predict(input_df)[0]

    var_prediction = prediction + residual_var

    return {
        "var_prediction": float(var_prediction)
    }