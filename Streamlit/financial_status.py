import streamlit as st
import numpy as np
import joblib

# ===============================
# LOAD MODEL
# ===============================
model = joblib.load("final_financial_model.pkl")

# 🔥 FIXED THRESHOLD
threshold = 0.45

st.set_page_config(page_title="Financial Risk Predictor")

st.title("🏦 Financial Status Prediction System")

# ===============================
# ONLY 5 FEATURES
# ===============================
features = [
    "ROA",
    "Leverage",
    "Asset_Turnover",
    "Gross_Profit_Liabilities",
    "Operating_Profit"
]

# ===============================
# LIMITS (same as before)
# ===============================
feature_limits = {
    "ROA": (-0.05, 0.55),
    "Leverage": (0.02, 1.20),
    "Asset_Turnover": (0.6, 5.0),
    "Gross_Profit_Liabilities": (-1.0, 50.0),
    "Operating_Profit": (-1.0, 100.0)
}

# ===============================
# INPUT UI
# ===============================
st.subheader("📊 Enter Financial Data")

inputs = []

for feature in features:
    min_val, max_val = feature_limits[feature]

    value = st.number_input(
        f"{feature} ({min_val} to {max_val})",
        min_value=float(min_val),
        max_value=float(max_val),
        value=float((min_val + max_val)/2),
        step=0.01
    )

    inputs.append(value)

# ===============================
# PREDICTION
# ===============================
if st.button("🔍 Predict"):

    input_array = np.array(inputs).reshape(1, -1)

    prob = model.predict_proba(input_array)[0][1]

    prediction = 1 if prob >= threshold else 0

    st.write(f"📈 Probability: {prob:.3f}")
    st.write(f"🎯 Threshold: {threshold}")

    if prediction == 1:
        st.error("⚠️ Weak Financial Company")
    else:
        st.success("✅ Financially Strong Company")

    st.progress(float(prob))