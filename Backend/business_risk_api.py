import pandas as pd
import joblib
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
from models import User, BusinessRisk

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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