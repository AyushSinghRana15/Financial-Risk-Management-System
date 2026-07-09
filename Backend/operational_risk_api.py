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

MODEL_FILE = os.path.join(MODELS_PATH, "operational_risk.pkl")

def _ensure_model_loaded():
    global model
    if model is not None:
        return
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
    # Fallback when no ML model is available — uses weighted sum of 3 factors
    # Process failures = 35%, System errors = 40%, Human errors = 25%
    raw = (
        row["process_failures"] * 0.35
        + row["system_errors"] * 0.4
        + row["human_errors"] * 0.25
    )
    return min(raw / 10.0, 1.0)  # Cap at 1.0 (100% risk)


@router.get("/operational_features")
def get_operational_features():
    return {"features": ["process_failures", "system_errors", "human_errors"]}


@router.post("/predict_operational_risk")
def predict_operational_risk(data: dict, db: Session = Depends(get_db)):
    _ensure_model_loaded()
    try:
        email = data.get("email")
        user_id = None
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                user_id = user.id

        # Accepts either primary names or Jira-style fallback names
        row = {
            "process_failures": float(data.get("process_failures", data.get("reassignment_count", 0))),
            "system_errors": float(data.get("system_errors", data.get("reopen_count", 0))),
            "human_errors": float(data.get("human_errors", data.get("sys_mod_count", 0))),
        }

        df = pd.DataFrame([row])

        if model is not None:
            pred = int(model.predict(df)[0])
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(df)[0]  # [prob_low, prob_high]
            else:
                proba = None
        else:
            score = _rule_based_score(row)
            pred = 1 if score > 0.5 else 0
            proba = np.array([1 - score, score])
            proba = proba / proba.sum()  # Normalize to sum to 1.0

        risk_label = "High Risk" if pred == 1 else "Low Risk"
        prob_high = float(max(proba)) if proba is not None else (pred * 0.8 + 0.1)
        prob_low = float(min(proba)) if proba is not None else (1 - prob_high)
        prob_medium = max(0.0, 1.0 - prob_high - prob_low)  # Remainder assigned to medium

        record = OperationalRisk(
            user_id=user_id,
            process_failures=int(row["process_failures"]),
            system_errors=int(row["system_errors"]),
            human_errors=int(row["human_errors"]),
            risk_score=float(pred),
            risk_level=risk_label,
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
                "severity": r.risk_level,
                "risk_score": r.risk_score,
                "predicted_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ]
    }
