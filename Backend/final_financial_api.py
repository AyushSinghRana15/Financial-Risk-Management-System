from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel  # For request body validation (type checking, required fields)
import numpy as np
import joblib
import sys
import os

CURRENT_FILE_PATH = os.path.abspath(__file__)
BACKEND_DIR = os.path.dirname(CURRENT_FILE_PATH)
SRC_DIR = os.path.dirname(BACKEND_DIR)

MODELS_PATH = os.path.join(SRC_DIR, "Models")
if not os.path.exists(MODELS_PATH):
    MODELS_PATH = os.path.join(SRC_DIR, "models")

MODEL_FILE = os.path.join(MODELS_PATH, "final_financial_model.pkl")

sys.path.append(BACKEND_DIR)
from database import SessionLocal
from models import User, FinancialRisk

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model = None
if os.path.exists(MODEL_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        print(f"✅ Successfully loaded: {MODEL_FILE}")
    except Exception as e:
        print(f"❌ Error loading model file: {e}")
else:
    print(f"❌ CRITICAL: File does not exist at {MODEL_FILE}")
    if os.path.exists(MODELS_PATH):
        print(f"Files inside {MODELS_PATH}: {os.listdir(MODELS_PATH)}")

# 🔥 FIXED THRESHOLD — probability above this = "Risky Company"
threshold = 0.45

# -------------------------
# INPUT SCHEMA
# -------------------------
class FinancialInput(BaseModel):
    # Pydantic model automatically validates types and required fields
    email: str = ""
    ROA: float  # Return on Assets = Net Income / Total Assets (profitability metric)
    Leverage: float  # Debt-to-Equity ratio (how much debt vs equity)
    Asset_Turnover: float  # Revenue / Total Assets (efficiency metric)
    Gross_Profit_Liabilities: float  # Gross Profit / Total Liabilities
    Operating_Profit: float  # Operating Income (profit from core operations)

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

    # predict_proba returns [prob_safe, prob_risky]; [0][1] = probability of "risky"
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
    ).order_by(FinancialRisk.created_at.desc()).limit(10).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "risk_score": r.risk_score,
                "risk_label": r.risk_label,
                "recorded_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]
    }