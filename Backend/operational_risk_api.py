import pandas as pd
import joblib
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
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
from models import User, OperationalRisk

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model = None
feature_keys = ["reassignment_count", "reopen_count", "sys_mod_count", "active", "made_sla"]

MODEL_FILE = os.path.join(MODELS_PATH, "operational_risk.pkl")

if os.path.exists(MODEL_FILE):
    try:
        loaded = joblib.load(MODEL_FILE)
        if hasattr(loaded, "predict"):
            model = loaded
            print(f"✅ Successfully loaded: {MODEL_FILE}")
        else:
            print(f"⚠️ Model file has type {type(loaded).__name__}, using rule-based fallback")
    except Exception as e:
        print(f"❌ Error loading model file: {e}")
else:
    print(f"❌ CRITICAL: File does not exist at {MODEL_FILE}")


def _rule_based_score(row):
    raw = (
        row["reassignment_count"] * 0.3
        + row["reopen_count"] * 0.4
        + row["sys_mod_count"] * 0.2
        + (1 - row["made_sla"]) * 0.1
    )
    return min(raw, 1.0)


@router.get("/operational_features")
def get_operational_features():
    return {"features": feature_keys}


@router.post("/predict_operational_risk")
def predict_operational_risk(data: dict, db: Session = Depends(get_db)):
    try:
        email = data.get("email")
        user_id = None
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                user_id = user.id

        row = {
            "reassignment_count": float(data.get("reassignment_count", 0)),
            "reopen_count": float(data.get("reopen_count", 0)),
            "sys_mod_count": float(data.get("sys_mod_count", 0)),
            "active": 1 if str(data.get("active", "No")).lower() == "yes" else 0,
            "made_sla": 1 if str(data.get("made_sla", "No")).lower() == "yes" else 0,
        }

        df = pd.DataFrame([row])

        if model is not None:
            pred = int(model.predict(df)[0])
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(df)[0]
            else:
                proba = None
        else:
            score = _rule_based_score(row)
            pred = 1 if score > 0.5 else 0
            proba = np.array([1 - score, score]) if score <= 1 else np.array([0, 1])
            proba = proba / proba.sum()

        risk_label = "High Risk" if pred == 1 else "Low Risk"
        prob_high = float(max(proba)) if proba is not None else (pred * 0.8 + 0.1)
        prob_low = float(min(proba)) if proba is not None else (1 - prob_high)
        prob_medium = max(0.0, 1.0 - prob_high - prob_low)

        record = OperationalRisk(
            user_id=user_id,
            event_type="operational_risk_prediction",
            severity=risk_label,
            risk_score=float(pred),
            description=f"Reassignments: {row['reassignment_count']}, Reopens: {row['reopen_count']}, SLA: {row['made_sla']}",
        )
        db.add(record)
        db.commit()

        return {
            "prediction": pred,
            "risk_level": risk_label,
            "probabilities": {
                "low": round(prob_low, 4),
                "medium": round(prob_medium, 4),
                "high": round(prob_high, 4),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/operational_risk_history")
def get_operational_risk_history(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"history": []}

    records = (
        db.query(OperationalRisk)
        .filter(OperationalRisk.user_id == user.id)
        .order_by(desc(OperationalRisk.id))
        .limit(10)
        .all()
    )

    return {
        "history": [
            {
                "id": r.id,
                "severity": r.severity,
                "risk_score": r.risk_score,
                "predicted_at": r.occurred_at.isoformat() if r.occurred_at else None,
            }
            for r in records
        ]
    }
