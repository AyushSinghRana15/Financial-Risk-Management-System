from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import numpy as np
import joblib
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
sys.path.append(BASE_DIR)

from database import SessionLocal
from models import User, FinancialRisk

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# LOAD MODEL
# -------------------------
MODELS_PATH = os.path.join(ROOT_DIR, "Models")
try:
    model = joblib.load(os.path.join(MODELS_PATH, "final_financial_model.pkl"))
    print(f"Successfully loaded final_financial_model.pkl from {MODELS_PATH}")
except Exception as e:
    print(f"Error loading final_financial_model.pkl: {e}")

# 🔥 FIXED THRESHOLD
threshold = 0.45

# -------------------------
# INPUT SCHEMA
# -------------------------
class FinancialInput(BaseModel):
    email: str = ""
    ROA: float
    Leverage: float
    Asset_Turnover: float
    Gross_Profit_Liabilities: float
    Operating_Profit: float

# -------------------------
# API
# -------------------------
@router.post("/predict")
def predict(data: FinancialInput, db: Session = Depends(get_db)):

    input_array = np.array([[
        data.ROA,
        data.Leverage,
        data.Asset_Turnover,
        data.Gross_Profit_Liabilities,
        data.Operating_Profit
    ]])

    prob = model.predict_proba(input_array)[0][1]

    if prob >= threshold:
        result_label = "Financially Risky Company"
    else:
        result_label = "Financially Strong Company"

    response = {
        "probability": float(round(prob, 2)),
        "threshold": 0.45,
        "result": result_label
    }

    email = data.email
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            record = FinancialRisk(
                user_id=user.id,
                risk_score=float(prob),
                risk_label=result_label
            )
            db.add(record)
            db.commit()

    return response

@router.get("/history")
def get_financial_history(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"history": []}
    
    records = db.query(FinancialRisk).filter(
        FinancialRisk.user_id == user.id
    ).order_by(FinancialRisk.recorded_at.desc()).limit(10).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "risk_score": r.risk_score,
                "risk_label": r.risk_label,
                "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
            }
            for r in records
        ]
    }