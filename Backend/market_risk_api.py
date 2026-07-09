import pandas as pd
import joblib
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
from sqlalchemy.orm import Session
import yfinance as yf  # Yahoo Finance API — fetches live stock/index prices
import numpy as np
import sys
import os

CURRENT_FILE_PATH = os.path.abspath(__file__)
BACKEND_DIR = os.path.dirname(CURRENT_FILE_PATH)
SRC_DIR = os.path.dirname(BACKEND_DIR)

MODELS_PATH = os.path.join(SRC_DIR, "Models")
if not os.path.exists(MODELS_PATH):
    MODELS_PATH = os.path.join(SRC_DIR, "models")

# VaR (Value at Risk) model: estimates max potential loss over a time period
# The model was trained on global market indices and commodities
MODEL_FILE = os.path.join(MODELS_PATH, "ml_var_model.pkl")

sys.path.append(BACKEND_DIR)
from database import SessionLocal
from models import User, MarketRiskData

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model_package = None
model = None
features = []  # List of ticker symbols the model expects
residual_var = None  # Residual variance: additional uncertainty not captured by the model

def _ensure_model_loaded():
    global model_package, model, features, residual_var
    if model is not None:
        return
    if os.path.exists(MODEL_FILE):
        try:
            model_package = joblib.load(MODEL_FILE)
            model = model_package["model"]
            features = model_package["features"]
            residual_var = model_package["residual_var"]
            print(f"✅ Successfully loaded: {MODEL_FILE}")
        except Exception as e:
            print(f"❌ Error loading model file: {e}")
    else:
        print(f"❌ CRITICAL: File does not exist at {MODEL_FILE}")
        if os.path.exists(MODELS_PATH):
            print(f"Files inside {MODELS_PATH}: {os.listdir(MODELS_PATH)}")

# ----------------------------
# FEATURE NAME CLEANING
# ----------------------------
# Converts Yahoo Finance ticker symbols into human-readable names

def clean_feature_name(feature):

    feature_map = {
        "^NSEI": "NIFTY 50",  # National Stock Exchange of India index
        "^INDIAVIX": "India VIX",  # India Volatility Index (fear gauge)
        "^DJI": "Dow Jones Industrial Average",  # US blue-chip index
        "^GSPC": "S&P 500",  # US large-cap index
        "^IXIC": "NASDAQ Composite",  # Tech-heavy US index
        "^FTSE": "FTSE 100",  # UK index
        "^N225": "Nikkei 225",  # Japan index
        "^HSI": "Hang Seng Index",  # Hong Kong index
        "^BSESN": "Sensex",  # Indian index (BSE)
        "GC=F": "Gold Futures",  # Gold commodity
        "CL=F": "Crude Oil Futures",  # Oil commodity
        "SI=F": "Silver Futures",
        "DX-Y.NYB": "US Dollar Index",  # USD strength vs major currencies
        "INR=X": "USD/INR Exchange Rate",  # Dollar to Rupee rate
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
    _ensure_model_loaded()
    cleaned_labels = [clean_feature_name(f) for f in features]

    return {
        "features": features,
        "labels": cleaned_labels
    }
# ----------------------------
# LIVE MARKET DATA (YAHOO FINANCE)
# ----------------------------
# Fetches real-time prices for all features the model was trained on

def fetch_live_market_data():
    _ensure_model_loaded()
    try:
        data = {}

        for feature in features:
            try:
                # Download 2 days of data so we can calculate daily returns
                ticker = yf.download(feature, period="2d", progress=False, timeout=2)

                # If data not available → skip
                if ticker.empty or len(ticker) < 2:
                    data[feature] = 0
                    continue

                # If feature is index/stock → use percentage return
                if feature.startswith("^") or "=X" in feature or "=F" in feature:
                    prev_close = ticker["Close"].iloc[-2]  # Yesterday's close
                    latest_close = ticker["Close"].iloc[-1]  # Today's close

                    value = (latest_close - prev_close) / prev_close  # Daily return %

                else:
                    # fallback → raw close price
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
# VaR (Value at Risk) = the maximum loss expected over a period at a given confidence level
# e.g., "95% VaR of 5%" means there's a 5% chance of losing more than 5% in a day

@router.post("/predict_market_risk")
@limiter.limit("10/minute")
def predict_market_risk(request: Request, data: dict, db: Session = Depends(get_db)):
    _ensure_model_loaded()
    if model is None:
        return {"error": "Market risk model not loaded", "predicted_var": 0, "risk_level": "Unknown"}
    confidence = data.get("confidence", "95%")

    input_values = []

    for feature in features:
        input_values.append(data.get(feature, 0))

    input_df = pd.DataFrame([input_values], columns=features)

    prediction = model.predict(input_df)[0]

    # Add residual variance: accounts for uncertainty the model couldn't capture
    var_prediction = prediction + residual_var

    # ----------------------------
    # RISK CLASSIFICATION
    # ----------------------------
    # VaR thresholds: >5% = high risk, 2-5% = moderate, <2% = low

    if var_prediction > 0.05:
        risk_level = "High Market Risk"

    elif var_prediction > 0.02:
        risk_level = "Moderate Market Risk"

    else:
        risk_level = "Low Market Risk"

    # ----------------------------
    # RESPONSE
    # ----------------------------

    result = {
        "predicted_var": float(var_prediction),
        "residual_variance": float(residual_var),
        "confidence_level": confidence,
        "risk_level": risk_level
    }

    email = data.get("email")
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            record = MarketRiskData(
                user_id=user.id,
                symbol="Portfolio",
                risk_score=float(var_prediction),
                risk_level=risk_level
            )
            db.add(record)
            db.commit()

    return result

@router.get("/market_risk_history")
def get_market_risk_history(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"history": []}
    
    records = db.query(MarketRiskData).filter(
        MarketRiskData.user_id == user.id
    ).order_by(MarketRiskData.recorded_at.desc()).limit(10).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "symbol": r.symbol,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
            }
            for r in records
        ]
    }