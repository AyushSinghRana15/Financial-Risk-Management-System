import pandas as pd
import joblib
from fastapi import APIRouter
import yfinance as yf
import numpy as np

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
# LIVE MARKET DATA (YAHOO FINANCE)
# ----------------------------

def fetch_live_market_data():
    try:
        data = {}

        for feature in features:
            try:
                ticker = yf.download(feature, period="2d", progress=False, timeout=2)

                # If data not available → skip
                if ticker.empty or len(ticker) < 2:
                    data[feature] = 0
                    continue

                # If feature is index/stock → use return
                if feature.startswith("^") or "=X" in feature or "=F" in feature:
                    prev_close = ticker["Close"].iloc[-2]
                    latest_close = ticker["Close"].iloc[-1]

                    value = (latest_close - prev_close) / prev_close

                else:
                    # fallback → raw close
                    value = ticker["Close"].iloc[-1]

                data[feature] = float(value) if not np.isnan(value) else 0

            except Exception as inner_error:
                print(f"Error fetching {feature}:", inner_error)
                data[feature] = 0

        return data

    except Exception as e:
        print("Live market data error:", e)
        return {}

# ----------------------------
# GET LIVE MARKET DATA
# ----------------------------

@router.get("/market_live_data")
def get_live_market_data():
    return fetch_live_market_data()


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