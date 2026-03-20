import streamlit as st
import numpy as np
import joblib

# ===============================
# LOAD FILES
# ===============================
model = joblib.load("final_financial_model.pkl")
selector = joblib.load("financial_selector.pkl")

# 🔥 FIXED THRESHOLD
threshold = 0.45

st.set_page_config(page_title="Financial Risk Predictor")

st.title("🏦 Financial Status Prediction System")

# ===============================
# ALL FEATURES
# ===============================
all_features = [
"ROA","Leverage","Working_Capital","Liquidity","EBIT",
"Asset_Turnover","Equity_Ratio","Gross_Profit_Liabilities",
"Net_Profit_Margin","Operating_ROA","Net_Profit_Liabilities",
"Operating_Profit","Gross_Profit_Margin","Operating_Expense",
"Inventory_Turnover"
]

# ===============================
# LIMITS
# ===============================
feature_limits = {
    "ROA": (-0.05, 0.55),
    "Leverage": (0.02, 1.20),
    "Working_Capital": (-0.25, 0.75),
    "Liquidity": (0.8, 60.0),
    "EBIT": (-0.05, 0.65),
    "Asset_Turnover": (0.6, 5.0),
    "Equity_Ratio": (-0.2, 1.0),
    "Gross_Profit_Liabilities": (-1.0, 50.0),
    "Net_Profit_Margin": (-0.1, 0.7),
    "Operating_ROA": (-0.1, 0.7),
    "Net_Profit_Liabilities": (-0.1, 1.0),
    "Operating_Profit": (-1.0, 100.0),
    "Gross_Profit_Margin": (-0.1, 1.2),
    "Operating_Expense": (1.0, 50.0),
    "Inventory_Turnover": (3.0, 25.0)
}

# ===============================
# INPUT UI (NUMBER INPUT)
# ===============================
st.subheader("📊 Enter Financial Data")

inputs = []

for feature in all_features:
    min_val, max_val = feature_limits.get(feature, (-5.0, 5.0))

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

    # Apply selector
    input_sel = selector.transform(input_array)

    # Probability
    prob = model.predict_proba(input_sel)[0][1]

    # Prediction
    prediction = 1 if prob >= threshold else 0

    st.write(f"📈 Probability: {prob:.3f}")
    st.write(f"🎯 Threshold: {threshold}")

    if prediction == 1:
        st.error("⚠️ Weak Financial Company")
    else:
        st.success("✅ Financially Strong Company")

    st.progress(float(prob))