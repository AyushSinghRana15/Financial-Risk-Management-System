from fastapi import FastAPI
import pandas as pd
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter

router = APIRouter()
# -------------------------
# Load Model
# -------------------------

model = joblib.load("../Models/balanced_xgboost_model.pkl")
# Load Market Risk Model
market_model = joblib.load("../Models/ml_var_model.pkl")
feature_names = joblib.load("../Models/model_features.pkl")


# -------------------------
# Credit Risk Endpoint
# -------------------------

@router.post("/predict_credit_risk")
def predict_credit_risk(data: dict):

    # Basic Inputs
    income = data["income"]
    credit = data["credit"]
    annuity = data["annuity"]
    goods_price = data["goods_price"]

    children = data["children"]
    age = data["age"]
    employment_years = data["employment_years"]

    ext1 = data["ext1"]
    ext2 = data["ext2"]
    ext3 = data["ext3"]

    family_members = data["family_members"]

    bureau_year = data["bureau_year"]
    bureau_week = data["bureau_week"]
    bureau_month = data["bureau_month"]

    def30 = data["def30"]
    def60 = data["def60"]

    gender = data["gender"]
    owns_car = data["owns_car"]
    owns_house = data["owns_house"]
    education = data["education"]

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

    df = pd.DataFrame([features])

    # Align features with training order
    df = df.reindex(columns=feature_names, fill_value=0)

    prob = model.predict_proba(df)[0][1]
    pred = model.predict(df)[0]

    return {
        "default_probability": float(prob),
        "prediction": int(pred),
        "risk_level": "High Risk" if pred == 1 else "Low Risk"
    }