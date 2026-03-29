from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
import joblib
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
sys.path.append(BASE_DIR)

from database import SessionLocal
from models import User, FraudPrediction

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------
# Load Model & Features
# -------------------------------
MODELS_PATH = os.path.join(ROOT_DIR, "Models")
model = None
features = []
try:
    model = joblib.load(os.path.join(MODELS_PATH, "E_commerce_fraud_xgboost_model.pkl"))
    features = joblib.load(os.path.join(MODELS_PATH, "E_commerce_model_features.pkl"))
    print(f"Successfully loaded e-commerce fraud models from {MODELS_PATH}")
except Exception as e:
    print(f"Error loading e-commerce fraud models: {e}")

# -------------------------------
# Mappings
# -------------------------------

payment_map = {
    "Credit Card": 0,
    "Debit Card": 1,
    "PayPal": 2,
    "Bank Transfer": 3
}

product_map = {
    "Electronics": 0,
    "Clothing": 1,
    "Home": 2,
    "Beauty": 3
}

location_map = {
    "USA": 0,
    "UK": 1,
    "India": 2,
    "Germany": 3
}

device_map = {
    "Mobile": 0,
    "Desktop": 1,
    "Tablet": 2
}

# -------------------------------
# API Endpoint
# -------------------------------

@router.post("/predict_fraud")
def predict_fraud(data: dict, db: Session = Depends(get_db)):
    try:
        # ✅ correct feature order dataframe
        df = pd.DataFrame(columns=features)
        df.loc[0] = 0

        df["Transaction Amount"] = data.get("amount", 100)
        df["Quantity"] = data.get("quantity", 1)

        payment = data.get("payment_method", "Credit Card")
        product = data.get("product_category", "Electronics")
        location = data.get("customer_location", "USA")
        device = data.get("device_used", "Mobile")

        df["Payment Method"] = payment_map.get(payment, 0)
        df["Product Category"] = product_map.get(product, 0)
        df["Customer Location"] = location_map.get(location, 0)
        df["Device Used"] = device_map.get(device, 0)

        df["Customer Age"] = data.get("customer_age", 30)
        df["Account Age Days"] = data.get("account_age_days", 200)
        df["Transaction Hour"] = data.get("transaction_hour", 12)
        df["Transaction_Day"] = data.get("transaction_day", 15)
        df["Transaction_Month"] = data.get("transaction_month", 6)

        # 🔥 enforce correct order
        df = df[features]

        # Prediction
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]

        result = {
            "prediction": int(prediction),
            "fraud_probability": float(probability),
            "label": "Fraud" if prediction == 1 else "Legitimate"
        }

        email = data.get("email")
        if email:
            user = db.query(User).filter(User.email == email).first()
            if user:
                record = FraudPrediction(
                    user_id=user.id,
                    amount=float(data.get("amount", 0)),
                    payment_method=data.get("payment_method", ""),
                    product_category=data.get("product_category", ""),
                    fraud_probability=float(probability),
                    label=result["label"]
                )
                db.add(record)
                db.commit()

        return result

    except Exception as e:
        return {"error": str(e)}

@router.get("/fraud_history")
def get_fraud_history(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"history": []}
    
    records = db.query(FraudPrediction).filter(
        FraudPrediction.user_id == user.id
    ).order_by(FraudPrediction.predicted_at.desc()).limit(10).all()
    
    return {
        "history": [
            {
                "id": r.id,
                "amount": r.amount,
                "payment_method": r.payment_method,
                "product_category": r.product_category,
                "fraud_probability": r.fraud_probability,
                "label": r.label,
                "predicted_at": r.predicted_at.isoformat() if r.predicted_at else None
            }
            for r in records
        ]
    }
