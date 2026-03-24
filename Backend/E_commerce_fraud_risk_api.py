from fastapi import APIRouter
import pandas as pd
import joblib
import os

router = APIRouter()

# -------------------------------
# Load Model & Features
# -------------------------------

import os
import joblib

# ✅ go to project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ✅ correct Models path
MODELS_PATH = os.path.join(PROJECT_ROOT, "Models")

# ✅ load files
model = joblib.load(os.path.join(MODELS_PATH, "E_commerce_fraud_xgboost_model.pkl"))
# -------------------------------
# Mappings (same as Streamlit)
# -------------------------------
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
def predict_fraud(data: dict):
    try:
        # Create empty dataframe with correct feature order
        df = pd.DataFrame(columns=features)
        df.loc[0] = 0

        # Fill values
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

        # Prediction
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]

        return {
            "prediction": int(prediction),
            "fraud_probability": float(probability),
            "label": "Fraud" if prediction == 1 else "Legitimate"
        }

    except Exception as e:
        return {
            "error": str(e)
        }