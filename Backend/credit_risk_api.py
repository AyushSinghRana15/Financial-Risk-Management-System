from fastapi import APIRouter
import pandas as pd
import numpy as np
import joblib

router = APIRouter()

# -------------------------
# Load Model
# -------------------------

model = joblib.load("../Models/balanced_xgboost_model.pkl")

# Get feature names directly from trained model
feature_names = model.get_booster().feature_names

# -------------------------
# Credit Risk Endpoint
# -------------------------

@router.post("/predict_credit_risk")
def predict_credit_risk(data: dict):

    # -------------------------
    # Safe Input Extraction
    # -------------------------

    income = data.get("income", 0)
    credit = data.get("credit", 0)
    annuity = data.get("annuity", 0)
    goods_price = data.get("goods_price", 0)

    children = data.get("children", 0)
    age = data.get("age", 0)
    employment_years = data.get("employment_years", 0)

    ext1 = data.get("ext1", 0)
    ext2 = data.get("ext2", 0)
    ext3 = data.get("ext3", 0)

    family_members = data.get("family_members", 0)

    bureau_year = data.get("bureau_year", 0)
    bureau_week = data.get("bureau_week", 0)
    bureau_month = data.get("bureau_month", 0)

    def30 = data.get("def30", 0)
    def60 = data.get("def60", 0)

    gender = data.get("gender", "Male")
    owns_car = data.get("owns_car", "No")
    owns_house = data.get("owns_house", "No")
    education = data.get("education", "Secondary / secondary special")

    # -------------------------
    # Feature Engineering
    # -------------------------

    credit_income_ratio = credit / income if income != 0 else 0
    annuity_income_ratio = annuity / income if income != 0 else 0
    credit_term = annuity / credit if credit != 0 else 0

    ext_mean = np.mean([ext1, ext2, ext3])
    ext_std = np.std([ext1, ext2, ext3])
    ext_min = np.min([ext1, ext2, ext3])
    ext_max = np.max([ext1, ext2, ext3])

    income_per_child = income / (1 + children)
    credit_goods_ratio = credit / goods_price if goods_price != 0 else 0

    # -------------------------
    # Feature Dictionary
    # -------------------------

    features = {

        "AMT_INCOME_TOTAL": income,
        "AMT_CREDIT": credit,
        "AMT_ANNUITY": annuity,
        "AMT_GOODS_PRICE": goods_price,

        "CNT_CHILDREN": children,
        "CNT_FAM_MEMBERS": family_members,

        "AGE_YEARS": age,
        "EMPLOYED_YEARS": employment_years,

        "EXT_SOURCE_1": ext1,
        "EXT_SOURCE_2": ext2,
        "EXT_SOURCE_3": ext3,

        "EXT_SOURCE_MEAN": ext_mean,
        "EXT_SOURCE_STD": ext_std,
        "EXT_SOURCE_MIN": ext_min,
        "EXT_SOURCE_MAX": ext_max,

        "CREDIT_INCOME_RATIO": credit_income_ratio,
        "ANNUITY_INCOME_RATIO": annuity_income_ratio,
        "CREDIT_TERM": credit_term,

        "INCOME_PER_CHILD": income_per_child,
        "CREDIT_GOODS_RATIO": credit_goods_ratio,

        "AMT_REQ_CREDIT_BUREAU_YEAR": bureau_year,
        "AMT_REQ_CREDIT_BUREAU_WEEK": bureau_week,
        "AMT_REQ_CREDIT_BUREAU_MON": bureau_month,

        "DEF_30_CNT_SOCIAL_CIRCLE": def30,
        "DEF_60_CNT_SOCIAL_CIRCLE": def60,

        "CODE_GENDER_M": 1 if gender == "Male" else 0,
        "FLAG_OWN_CAR_Y": 1 if owns_car == "Yes" else 0,
        "FLAG_OWN_REALTY_Y": 1 if owns_house == "Yes" else 0,

        "NAME_EDUCATION_TYPE_Higher education": 1 if education == "Higher education" else 0,
        "NAME_EDUCATION_TYPE_Incomplete higher": 1 if education == "Incomplete higher" else 0,
        "NAME_EDUCATION_TYPE_Lower secondary": 1 if education == "Lower secondary" else 0,
        "NAME_EDUCATION_TYPE_Secondary / secondary special": 1 if education == "Secondary / secondary special" else 0
    }

    # -------------------------
    # Create DataFrame
    # -------------------------

    df = pd.DataFrame([features])

    # Align dataframe with training features
    df = df.reindex(columns=feature_names, fill_value=0)

    # Ensure exact column order
    df = df[feature_names]

    # -------------------------
    # Prediction
    # -------------------------

    prob = model.predict_proba(df)[0][1]
    pred = model.predict(df)[0]

    # -------------------------
    # Response
    # -------------------------

    return {
        "default_probability": float(prob),
        "prediction": int(pred),
        "risk_level": "High Risk" if pred == 1 else "Low Risk"
    }