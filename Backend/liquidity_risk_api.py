# ----------------------------
# IMPORTS
# ----------------------------
import pandas as pd
import joblib
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import numpy as np
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
from models import User, LiquidityRisk

# ----------------------------
# ROUTER INIT
# ----------------------------
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# LOAD MODEL & SCALER
# ----------------------------
model = joblib.load("../Models/liquidity_model.pkl")
scaler = joblib.load("../Models/scaler.pkl")

# ----------------------------
# FEATURES (25)
# ----------------------------
features = ["EWAQ_GrossLoans",
            "26_PROMISSORY_NOTES",
            "XX_TOTAL_LIQUID_ASSET",
            "18_BANKS_TZ","03_SAVINGS",
            "22_TREASURY_BILLS",
            "02_TIME_DEPOSIT",
            "XX_TOTAL_LIQUID_LIAB",
            "06_BORROWING_FROM_PUBLIC",
            "EWAQ_NPL",
            "10_FOREIGN_DEPOSITS_AND_BORROWINGS",
            "15_SMR_ACC","05_BANKS_DEPOSITS",
            "04_OTHER_DEPOSITS",
            "25_COMMERCIAL_BILLS",
            "11_OFF_BALSHEET_COMMITMENTS",
            "07_INTERBANKS_LOAN_PAYABLE",
            "INF",
            "XX_BAL_IN_OTHER_BANKS",
            "EWAQ_NPLsNetOfProvisions2CoreCapital",
            "EWAQ_Capital",
            "01_CURR_ACC",
            "24_FOREIGN_CURRENCY",
            "IBCM","08_CHEQUES_ISSUED"
            ]
    


# ----------------------------
# CLEAN LABELS
# ----------------------------
feature_map = {
    "EWAQ_GrossLoans": "Gross Loans",
    "26_PROMISSORY_NOTES": "Promissory Notes",
    "XX_TOTAL_LIQUID_ASSET": "Total Liquid Assets",
    "18_BANKS_TZ": "Banks",
    "03_SAVINGS": "Savings",
    "22_TREASURY_BILLS": "Treasury Bills",
    "02_TIME_DEPOSIT": "Time Deposits",
    "XX_TOTAL_LIQUID_LIAB": "Total Liquid Liabilities",
    "06_BORROWING_FROM_PUBLIC": "Public Borrowings",
    "EWAQ_NPL": "NPL",
    "10_FOREIGN_DEPOSITS_AND_BORROWINGS": "Foreign Deposits",
    "15_SMR_ACC": "SMR Accounts",
    "05_BANKS_DEPOSITS": "Bank Deposits",
    "04_OTHER_DEPOSITS": "Other Deposits",
    "25_COMMERCIAL_BILLS": "Commercial Bills",
    "11_OFF_BALSHEET_COMMITMENTS": "Off-Balance Commitments",
    "07_INTERBANKS_LOAN_PAYABLE": "Interbank Loans",
    "INF": "Inflation",
    "XX_BAL_IN_OTHER_BANKS": "Balance in Banks",
    "EWAQ_NPLsNetOfProvisions2CoreCapital": "NPL Ratio",
    "EWAQ_Capital": "Capital",
    "01_CURR_ACC": "Current Accounts",
    "24_FOREIGN_CURRENCY": "Foreign Currency",
    "IBCM": "Interbank Market",
    "08_CHEQUES_ISSUED": "Cheques Issued"
}

def clean_feature_name(f):
    return feature_map.get(f, f)

# ----------------------------
# GET FEATURES
# ----------------------------
@router.get("/features")
def get_features():
    return {
        "features": features,
        "labels": [clean_feature_name(f) for f in features]
    }

# ----------------------------
# SAMPLE INPUT
# ----------------------------
@router.get("/sample")
def sample():
    return {f: 0 for f in features}

# ----------------------------
# ----------------------------
# PREDICT API
# ----------------------------
@router.post("/predict")
def predict(data: dict, db: Session = Depends(get_db)):

    try:
        # ----------------------------
        # VALIDATE INPUT
        # ----------------------------
        if not data:
            return {"error": "No input data provided"}

        # ----------------------------
        # ARRANGE INPUT IN ORDER
        # ----------------------------
        values = []
        for f in features:
            val = data.get(f, 0)

            # convert safely to float
            try:
                val = float(val)
            except:
                val = 0

            values.append(val)

        # ----------------------------
        # CREATE DATAFRAME
        # ----------------------------
        df = pd.DataFrame([values], columns=features)

        # ----------------------------
        # SCALE INPUT
        # ----------------------------
        scaled = scaler.transform(df)

        # ----------------------------
        # PREDICT
        # ----------------------------
        pred = model.predict(scaled)[0]

        # ensure integer
        pred = int(pred)

        # ----------------------------
        # RISK MAPPING
        # ----------------------------
        risk_map = {
            0: "Very Low Risk",
            1: "Low Risk",
            2: "Medium Risk",
            3: "High Risk",
            4: "Very High Risk"
        }

        risk_level = risk_map.get(pred, "Unknown Risk")

        # ----------------------------
        # RESPONSE
        # ----------------------------
        result = {
            "prediction": pred,
            "risk_level": risk_level,
            "input_used": dict(zip(features, values))
        }

        email = data.get("email")
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                record = LiquidityRisk(
                    user_id=user.id,
                    risk_score=float(pred),
                    risk_label=risk_level
                )
                db.add(record)
                db.commit()

        return result

    except Exception as e:
        print("Prediction Error:", e)  # console debug
        return {
            "error": str(e)
        }

@router.get("/history")
def get_liquidity_history(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"history": []}
    
    records = db.query(LiquidityRisk).filter(
        LiquidityRisk.user_id == user.id
    ).order_by(LiquidityRisk.recorded_at.desc()).limit(10).all()
    
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