import streamlit as st
import pandas as pd
import joblib
import matplotlib.pyplot as plt

# ----------------------------
# PAGE CONFIG
# ----------------------------
st.set_page_config(
    page_title="Market Risk Dashboard",
    page_icon="📉",
    layout="wide"
)

st.title("📉 Market Risk Prediction System")
st.write("Machine Learning based Value at Risk (VaR) estimation")

st.markdown("---")

# ----------------------------
# LOAD MODEL
# ----------------------------
@st.cache_resource
def load_model():
    model_package = joblib.load(
        "/Users/ayushsingh/Deep Learning/Financial Risk Management Project/Models/ml_var_model.pkl"
    )
    return model_package

model_package = load_model()

model = model_package["model"]
features = model_package["features"]
residual_var = model_package["residual_var"]

# ----------------------------
# FEATURE LABEL CLEANING
# ----------------------------
def clean_feature_name(feature):

    name = feature.replace("^", "")

    name = name.replace("NSEI", "NIFTY 50")
    name = name.replace("INDIAVIX", "India VIX")

    name = name.replace("_", " ")

    return name.title()

# ----------------------------
# SIDEBAR
# ----------------------------
st.sidebar.header("Risk Configuration")

confidence = st.sidebar.selectbox(
    "Confidence Level",
    ["95%", "99%"]
)

st.sidebar.markdown("---")
st.sidebar.write("Financial Risk Management Dashboard")

# ----------------------------
# INPUT FEATURES
# ----------------------------
st.subheader("Market Indicators")

inputs = {}

col1, col2 = st.columns(2)

for i, feature in enumerate(features):

    label = clean_feature_name(feature)

    if i % 2 == 0:
        inputs[feature] = col1.number_input(
            label,
            value=0.0,
            help="Market indicator used for VaR estimation"
        )
    else:
        inputs[feature] = col2.number_input(
            label,
            value=0.0,
            help="Market indicator used for VaR estimation"
        )

st.markdown("---")

# ----------------------------
# PREDICTION
# ----------------------------
if st.button("Predict Market Risk"):

    input_df = pd.DataFrame([inputs])

    prediction = model.predict(input_df)[0]

    # add residual variance
    var_prediction = prediction + residual_var

    st.subheader("Predicted Value at Risk")

    st.metric(
        label="Predicted VaR",
        value=f"{var_prediction:.6f}"
    )

    # ----------------------------
    # RISK CLASSIFICATION
    # ----------------------------
    if var_prediction > 0.05:
        st.error("🔴 High Market Risk")

    elif var_prediction > 0.02:
        st.warning("🟠 Moderate Market Risk")

    else:
        st.success("🟢 Low Market Risk")

    st.markdown("---")

    # ----------------------------
    # VISUALIZATION
    # ----------------------------
    st.subheader("VaR Visualization")

    fig, ax = plt.subplots()

    ax.bar(["Predicted VaR"], [var_prediction])
    ax.set_ylabel("VaR")
    ax.set_title("Predicted Value at Risk")

    st.pyplot(fig)

    # ----------------------------
    # SUMMARY TABLE
    # ----------------------------
    st.subheader("Risk Summary")

    summary = pd.DataFrame({
        "Predicted VaR": [var_prediction],
        "Residual Variance": [residual_var],
        "Confidence Level": [confidence]
    })

    st.dataframe(summary)

# ----------------------------
# FOOTER
# ----------------------------
st.markdown("---")

st.caption(
    "Market Risk estimation using Machine Learning based Value at Risk model."
)