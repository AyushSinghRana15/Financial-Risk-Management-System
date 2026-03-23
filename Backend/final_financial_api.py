from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import joblib

router = APIRouter()

# -------------------------
# LOAD MODEL
# -------------------------
model = joblib.load("../Models/final_financial_model.pkl")

# 🔥 FIXED THRESHOLD
threshold = 0.45

# -------------------------
# INPUT SCHEMA
# -------------------------
class FinancialInput(BaseModel):
    ROA: float
    Leverage: float
    Asset_Turnover: float
    Gross_Profit_Liabilities: float
    Operating_Profit: float

# -------------------------
# API
# -------------------------
@router.post("/predict")
def predict(data: FinancialInput):

    input_array = np.array([[
        data.ROA,
        data.Leverage,
        data.Asset_Turnover,
        data.Gross_Profit_Liabilities,
        data.Operating_Profit
    ]])

    prob = model.predict_proba(input_array)[0][1]

    if prob >= threshold:
        result = "Financially Risky Company"
    else:
        result = "Financially Strong Company"

    return {
        "probability": float(round(prob, 2)),
        "threshold": 0.45,
        "result": result
    }