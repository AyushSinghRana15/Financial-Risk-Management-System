from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
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

MODEL_FILE = os.path.join(MODELS_PATH, "credit_risk_catboost.pkl")

sys.path.append(BACKEND_DIR)
from database import SessionLocal
from models import User, CreditPrediction

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

model = None
feature_names = []
model_data = None

if os.path.exists(MODEL_FILE):
    try:
        model_data = joblib.load(MODEL_FILE)
        if isinstance(model_data, dict):
            model = model_data["model"]
            feature_names = model_data.get("feature_columns", [])
            print(f"✅ Successfully loaded: {MODEL_FILE} (CatBoost model from dict)")
        else:
            model = model_data
            if hasattr(model, "get_feature_names"):
                feature_names = model.get_feature_names()
            elif hasattr(model, "get_booster"):
                feature_names = model.get_booster().feature_names
            else:
                feature_names = getattr(model, "feature_names_in_", [])
            print(f"✅ Successfully loaded: {MODEL_FILE}")
    except Exception as e:
        print(f"❌ Error loading model file: {e}")
else:
    print(f"❌ CRITICAL: File does not exist at {MODEL_FILE}")
    if os.path.exists(MODELS_PATH):
        print(f"Files inside {MODELS_PATH}: {os.listdir(MODELS_PATH)}")

# -------------------------
# Credit Risk Endpoint
# -------------------------

@router.post("/predict_credit_risk")
def predict_credit_risk(data: dict, db: Session = Depends(get_db)):
    if model is None:
        print("Model is None, attempting late load...")
        if os.path.exists(MODEL_FILE):
            try:
                globals()['model_data'] = joblib.load(MODEL_FILE)
                if isinstance(globals()['model_data'], dict):
                    globals()['model'] = globals()['model_data']["model"]
                    globals()['feature_names'] = globals()['model_data'].get("feature_columns", [])
                else:
                    globals()['model'] = globals()['model_data']
                    if hasattr(globals()['model'], "get_feature_names"):
                        globals()['feature_names'] = globals()['model'].get_feature_names()
                    elif hasattr(globals()['model'], "get_booster"):
                        globals()['feature_names'] = globals()['model'].get_booster().feature_names
                print("✅ Late load successful")
            except Exception as e:
                print(f"❌ Late load failed: {e}")
        
        if model is None:
            return {
                "status": "error",
                "message": "Credit model not initialized. Please check server logs.",
                "risk_level": "Unknown",
                "default_probability": 0.5
            }

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

    days_birth = -age * 365 if age > 0 else 0
    days_employed = -employment_years * 365 if employment_years > 0 else 0

    credit_income_ratio = credit / income if income != 0 else 0
    annuity_income_ratio = annuity / income if income != 0 else 0
    credit_term = annuity / credit if credit != 0 else 0

    ext_mean = np.mean([ext1, ext2, ext3]) if all(e > 0 for e in [ext1, ext2, ext3]) else 0.5
    ext_std = np.std([ext1, ext2, ext3]) if all(e > 0 for e in [ext1, ext2, ext3]) else 0
    ext_min = np.min([ext1, ext2, ext3]) if all(e > 0 for e in [ext1, ext2, ext3]) else 0
    ext_max = np.max([ext1, ext2, ext3]) if all(e > 0 for e in [ext1, ext2, ext3]) else 0

    ext_product = ext1 * ext2 * ext3 if all(e > 0 for e in [ext1, ext2, ext3]) else 0

    employed_birth_ratio = days_employed / days_birth if days_birth != 0 else 0

    ext1_missing = 1 if ext1 == 0 else 0
    ext2_missing = 1 if ext2 == 0 else 0
    ext3_missing = 1 if ext3 == 0 else 0

    # -------------------------
    # Feature Dictionary (matching CatBoost model expectations)
    # -------------------------

    features = {
        "AMT_INCOME_TOTAL": income,
        "AMT_CREDIT": credit,
        "AMT_ANNUITY": annuity,
        "AMT_GOODS_PRICE": goods_price,

        "CNT_CHILDREN": children,
        "CNT_FAM_MEMBERS": family_members,

        "DAYS_BIRTH": days_birth,
        "DAYS_EMPLOYED": days_employed,
        "DAYS_REGISTRATION": 0,
        "DAYS_ID_PUBLISH": 0,

        "AGE": age,
        "EMPLOYED_YEARS": employment_years,
        "EMPLOYED_BIRTH_RATIO": employed_birth_ratio,

        "EXT_SOURCE_1": ext1,
        "EXT_SOURCE_2": ext2,
        "EXT_SOURCE_3": ext3,

        "EXT_SOURCE_MEAN": ext_mean,
        "EXT_SOURCE_STD": ext_std,
        "EXT_SOURCE_MIN": ext_min,
        "EXT_SOURCE_MAX": ext_max,
        "EXT_SOURCE_PRODUCT": ext_product,

        "EXT_SOURCE_1_MISSING": ext1_missing,
        "EXT_SOURCE_2_MISSING": ext2_missing,
        "EXT_SOURCE_3_MISSING": ext3_missing,

        "CREDIT_INCOME_RATIO": credit_income_ratio,
        "ANNUITY_CREDIT_RATIO": credit_term,
        "ANNUITY_INCOME_RATIO": annuity_income_ratio,

        "AMT_REQ_CREDIT_BUREAU_YEAR": bureau_year,
        "AMT_REQ_CREDIT_BUREAU_WEEK": bureau_week,
        "AMT_REQ_CREDIT_BUREAU_MON": bureau_month,
        "AMT_REQ_CREDIT_BUREAU_HOUR": 0,
        "AMT_REQ_CREDIT_BUREAU_DAY": 0,
        "AMT_REQ_CREDIT_BUREAU_QRT": 0,

        "DEF_30_CNT_SOCIAL_CIRCLE": def30,
        "DEF_60_CNT_SOCIAL_CIRCLE": def60,
        "OBS_30_CNT_SOCIAL_CIRCLE": 0,
        "OBS_60_CNT_SOCIAL_CIRCLE": 0,

        "CODE_GENDER": "M" if gender == "Male" else "F",
        "FLAG_OWN_CAR": "Y" if owns_car == "Yes" else "N",
        "FLAG_OWN_REALTY": "Y" if owns_house == "Yes" else "N",

        "NAME_EDUCATION_TYPE": education,
        "NAME_CONTRACT_TYPE": "Cash loans",
        "NAME_TYPE_SUITE": "Unaccompanied",
        "NAME_INCOME_TYPE": "Working",
        "NAME_FAMILY_STATUS": "Single / not married",
        "NAME_HOUSING_TYPE": "House / apartment",
        "OCCUPATION_TYPE": "Unknown",
        "ORGANIZATION_TYPE": "XNA",

        "REGION_POPULATION_RELATIVE": 0.01,
        "REGION_RATING_CLIENT": 2,
        "REGION_RATING_CLIENT_W_CITY": 2,

        "FLAG_MOBIL": 1,
        "FLAG_EMP_PHONE": 1,
        "FLAG_WORK_PHONE": 0,
        "FLAG_CONT_MOBILE": 1,
        "FLAG_PHONE": 0,
        "FLAG_EMAIL": 0,

        "WEEKDAY_APPR_PROCESS_START": 2,
        "HOUR_APPR_PROCESS_START": 10,

        "REG_REGION_NOT_LIVE_REGION": 0,
        "REG_REGION_NOT_WORK_REGION": 0,
        "LIVE_REGION_NOT_WORK_REGION": 0,
        "REG_CITY_NOT_LIVE_CITY": 0,
        "REG_CITY_NOT_WORK_CITY": 0,
        "LIVE_CITY_NOT_WORK_CITY": 0,

        "DAYS_LAST_PHONE_CHANGE": -1000,

        "APARTMENTS_AVG": 0,
        "BASEMENTAREA_AVG": 0,
        "YEARS_BEGINEXPLUATATION_AVG": 0,
        "ELEVATORS_AVG": 0,
        "ENTRANCES_AVG": 0,
        "FLOORSMAX_AVG": 0,
        "LANDAREA_AVG": 0,
        "LIVINGAREA_AVG": 0,
        "NONLIVINGAREA_AVG": 0,

        "APARTMENTS_MODE": 0,
        "BASEMENTAREA_MODE": 0,
        "YEARS_BEGINEXPLUATATION_MODE": 0,
        "ELEVATORS_MODE": 0,
        "ENTRANCES_MODE": 0,
        "FLOORSMAX_MODE": 0,
        "LANDAREA_MODE": 0,
        "LIVINGAREA_MODE": 0,
        "NONLIVINGAREA_MODE": 0,
        "TOTALAREA_MODE": 0,

        "APARTMENTS_MEDI": 0,
        "BASEMENTAREA_MEDI": 0,
        "YEARS_BEGINEXPLUATATION_MEDI": 0,
        "ELEVATORS_MEDI": 0,
        "ENTRANCES_MEDI": 0,
        "FLOORSMAX_MEDI": 0,
        "LANDAREA_MEDI": 0,
        "LIVINGAREA_MEDI": 0,
        "NONLIVINGAREA_MEDI": 0,

        "HOUSEETYPE_MODE": "block of flats",
        "WALLSMATERIAL_MODE": "Stone, brick",
        "EMERGENCYSTATE_MODE": "No",

        "SK_ID_CURR": 0,

        "AMT_ANNUITY_MISSING": 0,
        "AMT_GOODS_PRICE_MISSING": 0,
        "CNT_FAM_MEMBERS_MISSING": 0,
        "APARTMENTS_AVG_MISSING": 1,
        "BASEMENTAREA_AVG_MISSING": 1,
        "YEARS_BEGINEXPLUATATION_AVG_MISSING": 1,
        "ELEVATORS_AVG_MISSING": 1,
        "ENTRANCES_AVG_MISSING": 1,
        "FLOORSMAX_AVG_MISSING": 1,
        "LANDAREA_AVG_MISSING": 1,
        "LIVINGAREA_AVG_MISSING": 1,
        "NONLIVINGAREA_AVG_MISSING": 1,
        "APARTMENTS_MODE_MISSING": 1,
        "BASEMENTAREA_MODE_MISSING": 1,
        "YEARS_BEGINEXPLUATATION_MODE_MISSING": 1,
        "ELEVATORS_MODE_MISSING": 1,
        "ENTRANCES_MODE_MISSING": 1,
        "FLOORSMAX_MODE_MISSING": 1,
        "LANDAREA_MODE_MISSING": 1,
        "LIVINGAREA_MODE_MISSING": 1,
        "NONLIVINGAREA_MODE_MISSING": 1,
        "APARTMENTS_MEDI_MISSING": 1,
        "BASEMENTAREA_MEDI_MISSING": 1,
        "YEARS_BEGINEXPLUATATION_MEDI_MISSING": 1,
        "ELEVATORS_MEDI_MISSING": 1,
        "ENTRANCES_MEDI_MISSING": 1,
        "FLOORSMAX_MEDI_MISSING": 1,
        "LANDAREA_MEDI_MISSING": 1,
        "LIVINGAREA_MEDI_MISSING": 1,
        "NONLIVINGAREA_MEDI_MISSING": 1,
        "TOTALAREA_MODE_MISSING": 1,
        "OBS_30_CNT_SOCIAL_CIRCLE_MISSING": 1,
        "DEF_30_CNT_SOCIAL_CIRCLE_MISSING": 1,
        "OBS_60_CNT_SOCIAL_CIRCLE_MISSING": 1,
        "DEF_60_CNT_SOCIAL_CIRCLE_MISSING": 1,
        "DAYS_LAST_PHONE_CHANGE_MISSING": 1,
        "AMT_REQ_CREDIT_BUREAU_HOUR_MISSING": 1,
        "AMT_REQ_CREDIT_BUREAU_DAY_MISSING": 1,
        "AMT_REQ_CREDIT_BUREAU_WEEK_MISSING": 1,
        "AMT_REQ_CREDIT_BUREAU_MON_MISSING": 1,
        "AMT_REQ_CREDIT_BUREAU_QRT_MISSING": 1,
        "AMT_REQ_CREDIT_BUREAU_YEAR_MISSING": 1,
    }

    for i in range(2, 22):
        features[f"FLAG_DOCUMENT_{i}"] = 0

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

    # -------------------------
    # Loan Amount Threshold Penalty
    # -------------------------

    HIGH_LOAN_THRESHOLD = 1000000
    LOAN_PENALTY = 0.05
    loan_penalty_applied = False

    if credit > HIGH_LOAN_THRESHOLD:
        prob = min(1.0, prob + LOAN_PENALTY)
        loan_penalty_applied = True

    # -------------------------
    # Decision Framework
    # -------------------------

    if prob < 0.35:
        risk_level = "Low Risk"
        decision = "Auto Approve"
        prediction = 0
    elif prob <= 0.65:
        risk_level = "Medium Risk"
        decision = "Manual Review"
        prediction = 0
    else:
        risk_level = "High Risk"
        decision = "Reject / Verify Further"
        prediction = 1

    # -------------------------
    # Response
    # -------------------------

    result = {
        "default_probability": float(prob),
        "prediction": int(prediction),
        "risk_level": risk_level,
        "decision": decision,
        "loan_penalty_applied": loan_penalty_applied,
        "base_probability": float(prob - (LOAN_PENALTY if loan_penalty_applied else 0))
    }

    # Save to DB if email provided
    email = data.get("email")
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            prediction = CreditPrediction(
                user_id=user.id,
                risk_score=float(prob),
                risk_label=result["risk_level"],
                confidence=0.95
            )
            db.add(prediction)
            db.commit()

    return result

@router.get("/credit_predictions")
def get_credit_predictions(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"predictions": []}
    
    predictions = db.query(CreditPrediction).filter(
        CreditPrediction.user_id == user.id
    ).order_by(CreditPrediction.predicted_at.desc()).limit(10).all()
    
    return {
        "predictions": [
            {
                "id": p.id,
                "risk_score": p.risk_score,
                "risk_label": p.risk_label,
                "confidence": p.confidence,
                "predicted_at": p.predicted_at.isoformat() if p.predicted_at else None
            }
            for p in predictions
        ]
    }