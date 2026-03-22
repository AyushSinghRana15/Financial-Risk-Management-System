import streamlit as st
import joblib
import pandas as pd
import shap
import numpy as np
import plotly.graph_objects as go
import time

# -----------------------------
# PAGE CONFIG
# -----------------------------

st.set_page_config(
    page_title="Operational Risk AI",
    page_icon="🤖",
    layout="wide"
)

# -----------------------------
# CUSTOM UI STYLE
# -----------------------------

st.markdown("""
<style>

.main-container{
border:1px solid #1f2937;
border-radius:20px;
padding:40px;
background-color:#0b1220;
box-shadow:0px 0px 40px rgba(0,0,0,0.7);
}

.title{
color:#38bdf8;
font-size:45px;
font-weight:700;
}

.metric-card{
background:#111827;
padding:20px;
border-radius:15px;
border:1px solid #1f2937;
text-align:center;
}

.predict-btn button{
background:linear-gradient(90deg,#ff4b4b,#ff7b7b);
color:white;
border-radius:10px;
height:50px;
width:200px;
font-size:18px;
}

</style>
""", unsafe_allow_html=True)

# -----------------------------
# LOAD MODEL
# -----------------------------

model = joblib.load("op-risk_model.pkl")
features = joblib.load("operational_risk.pkl")

explainer = shap.TreeExplainer(model)

# -----------------------------
# MAIN CONTAINER
# -----------------------------

st.markdown('<div class="main-container">', unsafe_allow_html=True)

# -----------------------------
# TITLE
# -----------------------------

st.markdown(
'<h1 class="title">🤖 Operational Risk Prediction System</h1>',
unsafe_allow_html=True
)

st.write("Predict operational risk using machine learning.")

# -----------------------------
# METRICS
# -----------------------------

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("Model","XGBoost")
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("Features Used","8")
    st.markdown('</div>', unsafe_allow_html=True)

with col3:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.metric("System Type","Operational Risk AI")
    st.markdown('</div>', unsafe_allow_html=True)

st.divider()

# -----------------------------
# USER INPUT
# -----------------------------

col1, col2 = st.columns(2)

with col1:

    amount = st.number_input("Transaction Amount",min_value=0.0)

    failed_attempts = st.number_input(
        "Failed Login Attempts",
        min_value=0
    )

    login_freq = st.number_input(
        "Login Frequency",
        min_value=0
    )

    latency = st.number_input(
        "System Latency",
        min_value=0.0
    )

with col2:

    transaction_type = st.selectbox(
        "Transaction Type",
        [0,1,2]
    )

    counterparty = st.number_input(
        "Counterparty Risk Score",
        min_value=0
    )

    payment_method = st.selectbox(
        "Payment Method",
        [0,1,2]
    )

    region = st.selectbox(
        "IP Region",
        [0,1,2,3]
    )

# -----------------------------
# PREDICT BUTTON
# -----------------------------

st.markdown('<div class="predict-btn">', unsafe_allow_html=True)
predict = st.button("Predict Risk")
st.markdown('</div>', unsafe_allow_html=True)

# -----------------------------
# PREDICTION
# -----------------------------

if predict:

    with st.spinner("AI analyzing transaction risk..."):
        time.sleep(1)

    data = {f:0 for f in features}

    data["Amount"] = amount
    data["Failed_Attempts"] = failed_attempts
    data["Login_Frequency"] = login_freq
    data["System_Latency"] = latency
    data["Transaction_Type"] = transaction_type
    data["Counterparty"] = counterparty
    data["Payment_Method"] = payment_method
    data["IP_Region"] = region

    input_df = pd.DataFrame([data])

    pred = model.predict(input_df)[0]
    prob = model.predict_proba(input_df)[0][1]

# -----------------------------
# RESULT
# -----------------------------

    st.subheader("Prediction Result")

    if pred == 1:
        st.error("High Operational Risk 🚨")
    else:
        st.success("Transaction Safe ✅")

    st.write("Risk Probability:",round(prob,2))

# -----------------------------
# PROGRESS BAR
# -----------------------------

    st.progress(int(prob*100))

# -----------------------------
# GAUGE CHART
# -----------------------------

    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=prob*100,
        title={'text':"Risk Probability"},
        gauge={
            'axis':{'range':[0,100]},
            'steps':[
                {'range':[0,30],'color':'green'},
                {'range':[30,60],'color':'yellow'},
                {'range':[60,100],'color':'red'}
            ]
        }
    ))

    st.plotly_chart(fig,use_container_width=True)

# -----------------------------
# SHAP EXPLANATION
# -----------------------------

    shap_values = explainer.shap_values(input_df)

    if isinstance(shap_values,list):
        shap_values = shap_values[1]

    st.subheader("Risk Explanation")

    for i,feature in enumerate(input_df.columns):

        impact = shap_values[0][i]

        if impact > 0:
            st.error(f"{feature} increased risk by {impact:.3f}")
        else:
            st.success(f"{feature} decreased risk by {abs(impact):.3f}")

# -----------------------------
# FEATURE IMPORTANCE
# -----------------------------

    st.subheader("Top Risk Drivers")

    importance = model.feature_importances_

    imp_df = pd.DataFrame({
        "Feature":features,
        "Importance":importance
    }).sort_values("Importance",ascending=False)

    st.bar_chart(imp_df.set_index("Feature"))

st.markdown('</div>', unsafe_allow_html=True)