import streamlit as st
import joblib
import pandas as pd
import shap
import matplotlib.pyplot as plt

# -----------------------------
# Load model and threshold
# -----------------------------
model = joblib.load("xgboost_business_risk_model.pkl")
threshold = joblib.load("risk_threshold.pkl")

# Create SHAP explainer
explainer = shap.TreeExplainer(model)

# -----------------------------
# Streamlit UI
# -----------------------------
st.set_page_config(page_title="Business Risk Prediction", layout="centered")

st.title("Business Risk Prediction System")
st.write("Enter financial indicators to predict bankruptcy risk")

# -----------------------------
# User Inputs
# -----------------------------
operating_profit = st.number_input("Operating Profit Rate", value=0.0)
debt_ratio = st.number_input("Debt Ratio", value=0.0)
current_ratio = st.number_input("Current Ratio", value=0.0)
cash_flow = st.number_input("Cash Flow Ratio", value=0.0)
profit_growth = st.number_input("Net Profit Growth Rate", value=0.0)

# -----------------------------
# Prediction Button
# -----------------------------
if st.button("Predict Risk"):

    # Create dataframe with same features used during training
    input_df = pd.DataFrame(columns=model.get_booster().feature_names)

    input_df.loc[0] = 0

    # Fill user inputs
    if "Operating Profit Rate" in input_df.columns:
        input_df["Operating Profit Rate"] = operating_profit

    if "Debt Ratio" in input_df.columns:
        input_df["Debt Ratio"] = debt_ratio

    if "Current Ratio" in input_df.columns:
        input_df["Current Ratio"] = current_ratio

    if "Cash flow rate" in input_df.columns:
        input_df["Cash flow rate"] = cash_flow

    if "Operating Profit Growth Rate" in input_df.columns:
        input_df["Operating Profit Growth Rate"] = profit_growth

    # -----------------------------
    # Prediction
    # -----------------------------
    prob = model.predict_proba(input_df)[0][1]

    prediction = int(prob > threshold)

    st.subheader("Prediction Result")

    if prob > 0.7:
        st.error("🔴 High Bankruptcy Risk")
    elif prob > 0.4:
        st.warning("🟡 Medium Risk")
    else:
        st.success("🟢 Low Risk")

    st.write("Risk Probability:", round(prob,3))

    st.progress(float(prob))

    # -----------------------------
    # SHAP Explanation
    # -----------------------------
    st.subheader("Model Explanation")

    shap_values = explainer.shap_values(input_df)

    fig, ax = plt.subplots()

    shap.waterfall_plot(
        shap.Explanation(
            values=shap_values[0],
            base_values=explainer.expected_value,
            data=input_df.iloc[0]
        ),
        show=False
    )

    st.pyplot(fig)