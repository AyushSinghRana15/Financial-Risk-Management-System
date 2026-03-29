import pandas as pd
import joblib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import sys
import os

CURRENT_FILE_PATH = os.path.abspath(__file__)
BACKEND_DIR = os.path.dirname(CURRENT_FILE_PATH)
SRC_DIR = os.path.dirname(BACKEND_DIR)

MODELS_PATH = os.path.join(SRC_DIR, "Models")
if not os.path.exists(MODELS_PATH):
    MODELS_PATH = os.path.join(SRC_DIR, "models")

sys.path.append(BACKEND_DIR)
from database import SessionLocal
from models import User, BusinessRisk

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model = None
threshold = None
feature_keys = []
raw_features = []

MODEL_FILE = os.path.join(MODELS_PATH, "xgboost_business_risk_model.pkl")
THRESHOLD_FILE = os.path.join(MODELS_PATH, "business_risk_threshold.pkl")

if os.path.exists(MODEL_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        threshold_file = joblib.load(THRESHOLD_FILE) if os.path.exists(THRESHOLD_FILE) else 0.5
        threshold = threshold_file
        if hasattr(model, "get_booster"):
            raw_features = list(model.get_booster().feature_names)
        feature_keys = [f"feature_{i}" for i in range(len(raw_features))]
        print(f"✅ Successfully loaded: {MODEL_FILE}")
    except Exception as e:
        print(f"❌ Error loading model file: {e}")
else:
    print(f"❌ CRITICAL: File does not exist at {MODEL_FILE}")
    if os.path.exists(MODELS_PATH):
        print(f"Files inside {MODELS_PATH}: {os.listdir(MODELS_PATH)}")

@router.get("/business_features")
def get_business_features():
    return {
        "features": feature_keys,
        "labels": raw_features
    }

@router.post("/predict_business_risk")
def predict_business_risk(data: dict, db: Session = Depends(get_db)):
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

    result = {
        "risk_probability": round(float(prob), 4),
        "risk_prediction": int(prediction),
        "threshold": float(threshold),
        "risk_level": risk_level
    }

    email = data.get("email")
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            record = BusinessRisk(
                user_id=user.id,
                risk_score=float(prob),
                risk_level=risk_level
            )
            db.add(record)
            db.commit()

    return result

@router.get("/business_risk_history")
def get_business_risk_history(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"history": []}
    
    records = db.query(BusinessRisk).filter(
        BusinessRisk.user_id == user.id
    ).order_by(BusinessRisk.recorded_at.desc()).limit(10).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "risk_score": r.risk_score,
                "risk_label": r.risk_level,
                "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
            }
            for r in records
        ]
    }