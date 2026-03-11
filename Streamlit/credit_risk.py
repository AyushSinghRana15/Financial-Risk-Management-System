import streamlit as st
import pandas as pd
import numpy as np
import joblib

st.title("Credit Risk Prediction System")
st.write("Enter borrower details to estimate default risk.")

# Load model
model = joblib.load("/Users/ayushsingh/Deep Learning/Financial Risk Management Project/Models/balanced_xgboost_model.pkl")

# -----------------------
# BASIC NUMERIC INPUTS
# -----------------------

income = st.number_input("Annual Income", value=150000)
credit = st.number_input("Credit Amount", value=300000)
annuity = st.number_input("Loan Annuity", value=20000)
goods_price = st.number_input("Goods Price", value=250000)

children = st.number_input("Number of Children", value=0)
age = st.number_input("Age (years)", value=35)
employment_years = st.number_input("Years Employed", value=5)

ext1 = st.number_input("External Risk Score 1", value=0.5)
ext2 = st.number_input("External Risk Score 2", value=0.5)
ext3 = st.number_input("External Risk Score 3", value=0.5)

# -----------------------
# ADDITIONAL IMPORTANT INPUTS
# -----------------------

st.header("Additional Risk Information")

family_members = st.number_input("Family Members", value=2)

bureau_year = st.number_input("Credit Bureau Requests (Year)", value=0)
bureau_week = st.number_input("Credit Bureau Requests (Week)", value=0)
bureau_month = st.number_input("Credit Bureau Requests (Month)", value=0)

def30 = st.number_input("Defaults in Social Circle (30 days)", value=0)
def60 = st.number_input("Defaults in Social Circle (60 days)", value=0)

# -----------------------
# CATEGORICAL INPUTS
# -----------------------

gender = st.selectbox("Gender", ["Male","Female"])
owns_car = st.selectbox("Owns Car", ["Yes","No"])
owns_house = st.selectbox("Owns Property", ["Yes","No"])

education = st.selectbox(
"Education",
[
"Higher education",
"Incomplete higher",
"Lower secondary",
"Secondary / secondary special"
]
)

income_type = st.selectbox(
"Income Type",
[
"Working",
"Commercial associate",
"Pensioner",
"State servant",
"Student",
"Unemployed"
]
)

housing = st.selectbox(
"Housing Type",
[
"House / apartment",
"Municipal apartment",
"Rented apartment",
"With parents"
]
)

# -----------------------
# FEATURE ENGINEERING
# -----------------------

credit_income_ratio = credit / income if income != 0 else 0
annuity_income_ratio = annuity / income if income != 0 else 0
credit_term = annuity / credit if credit != 0 else 0

ext_mean = np.mean([ext1,ext2,ext3])
ext_std = np.std([ext1,ext2,ext3])
ext_min = np.min([ext1,ext2,ext3])
ext_max = np.max([ext1,ext2,ext3])

income_per_child = income / (1 + children)
credit_goods_ratio = credit / goods_price if goods_price != 0 else 0

# -----------------------
# BUILD FEATURE VECTOR
# -----------------------

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

"CODE_GENDER_M": 1 if gender=="Male" else 0,
"FLAG_OWN_CAR_Y": 1 if owns_car=="Yes" else 0,
"FLAG_OWN_REALTY_Y": 1 if owns_house=="Yes" else 0,

"NAME_EDUCATION_TYPE_Higher education": 1 if education=="Higher education" else 0,
"NAME_EDUCATION_TYPE_Incomplete higher": 1 if education=="Incomplete higher" else 0,
"NAME_EDUCATION_TYPE_Lower secondary": 1 if education=="Lower secondary" else 0,
"NAME_EDUCATION_TYPE_Secondary / secondary special": 1 if education=="Secondary / secondary special" else 0
}

input_df = pd.DataFrame([features])

# -----------------------
# PREDICTION
# -----------------------

feature_names = joblib.load(
"/Users/ayushsingh/Deep Learning/Financial Risk Management Project/Models/model_features.pkl"
)

input_df = input_df.reindex(columns=feature_names, fill_value=0)

if st.button("Predict Default Risk"):

    prob = model.predict_proba(input_df)[0][1]
    pred = model.predict(input_df)[0]

    st.subheader("Prediction Result")

    if pred == 1:
        st.error(f"High Risk of Default\nProbability: {prob:.2f}")
    else:
        st.success(f"Low Risk of Default\nProbability: {prob:.2f}")