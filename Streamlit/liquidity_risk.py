import streamlit as st
import numpy as np
import pandas as pd
import joblib

# ==============================
# CSS (REMOVE +/- BUTTONS)
# ==============================
st.markdown(
    """
    <style>
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance: textfield;
    }
    button[aria-label="Increment value"],
    button[aria-label="Decrement value"] {
        display: none;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ==============================
# LOAD FILES
# ==============================
model = joblib.load("liquidity_model.pkl")
scaler = joblib.load("scaler.pkl")
features = joblib.load("features.pkl")

# ==============================
# UI
# ==============================
st.title("🏦 Liquidity Risk Predictor")
st.info("💡 Enter values in realistic financial range")

# ==============================
# LIMITS
# ==============================
limits = {
    "EWAQ_GrossLoans": (0, 5e12),
    "26_PROMISSORY_NOTES": (0, 5e10),
    "XX_TOTAL_LIQUID_ASSET": (0, 4e13),
    "18_BANKS_TZ": (0, 1e11),
    "03_SAVINGS": (0, 5e12),
    "22_TREASURY_BILLS": (0, 1e11),
    "02_TIME_DEPOSIT": (0, 5e12),
    "XX_TOTAL_LIQUID_LIAB": (0, 5e12),
    "06_BORROWING_FROM_PUBLIC": (0, 1e12),
    "EWAQ_NPL": (0, 1e11),
    "10_FOREIGN_DEPOSITS_AND_BORROWINGS": (0, 1e12),
    "15_SMR_ACC": (0, 1e11),
    "05_BANKS_DEPOSITS": (0, 1e12),
    "04_OTHER_DEPOSITS": (0, 1e12),
    "25_COMMERCIAL_BILLS": (0, 5e10),
    "11_OFF_BALSHEET_COMMITMENTS": (0, 2e12),
    "07_INTERBANKS_LOAN_PAYABLE": (0, 1e11),
    "INF": (0, 20),
    "XX_BAL_IN_OTHER_BANKS": (0, 1e12),
    "EWAQ_NPLsNetOfProvisions2CoreCapital": (0, 1),
    "EWAQ_Capital": (0, 1e12),
    "01_CURR_ACC": (0, 1e12),
    "24_FOREIGN_CURRENCY": (0, 1e12),
    "IBCM": (0, 20),
    "08_CHEQUES_ISSUED": (0, 1e11)
}

DEFAULT_LIMIT = (0, 1e11)

# ==============================
# INPUT
# ==============================
input_data = {}

for feature in features:
    min_val, max_val = limits.get(feature, DEFAULT_LIMIT)

    st.markdown(f"**{feature}**")

    val = st.number_input(
        "",
        min_value=float(min_val),
        max_value=float(max_val),
        value=float(min_val),
        key=feature
    )

    st.caption(f"Range: {min_val:.0e} to {max_val:.0e}")
    st.divider()

    input_data[feature] = val

# ==============================
# PREDICTION
# ==============================
if st.button("---- Predict Risk---"):

    input_df = pd.DataFrame([input_data])
    input_df = input_df[features]

    input_scaled = scaler.transform(input_df)

    probs = model.predict_proba(input_scaled)[0]

    # ==============================
    # FINAL SMART LOGIC
    # ==============================
    prediction = np.argmax(probs)

    # Medium override ONLY if balanced (NOT when High dominates)
    if prediction != 3:
        if 0.20 < probs[2] < 0.40 and abs(probs[0] - probs[3]) < 0.15:
            prediction = 2

    confidence = probs[prediction]

    labels = [
        "Very Low Risk",
        "Low Risk",
        "Medium Risk",
        "High Risk",
        "Very High Risk"
    ]

    label = labels[prediction]

    # ==============================
    # COLOR OUTPUT
    # ==============================
    colors = {
        "Very Low Risk": "green",
        "Low Risk": "lightgreen",
        "Medium Risk": "orange",
        "High Risk": "red",
        "Very High Risk": "darkred"
    }

    st.markdown(
        f"<h2 style='color:{colors[label]}'>{label}</h2>",
        unsafe_allow_html=True
    )

    st.info(f"Confidence: {confidence:.2f}")

    # ==============================
    # PROBABILITY GRAPH
    # ==============================
    prob_df = pd.DataFrame([probs], columns=labels)
    st.bar_chart(prob_df.T)

    prob_df = pd.DataFrame({
    "Risk Level": [
        "Very Low",
        "Low",
        "Medium",
        "High",
        "Very High"
    ],
    "Probability": probs
    })

    st.dataframe(prob_df)