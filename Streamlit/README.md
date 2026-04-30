# Streamlit - Legacy Interactive Apps

This folder contains standalone Streamlit applications that served as early interactive prototypes for the risk prediction modules. These apps have been superseded by the React dashboard and FastAPI backend but remain available for reference and local testing.

---

## Apps

| File | Risk Module | Description |
|------|-------------|-------------|
| `credit_risk.py` | Credit Risk | Interactive credit default prediction with applicant input form |
| `market_risk.py` | Market Risk | VaR calculator and market risk visualization |
| `business_streamlit.py` | Business Risk | Business risk assessment from financial metrics |
| `operational_streamlit.py` | Operational Risk | Operational risk scoring for transactions |
| `liquidity_risk.py` | Liquidity Risk | Liquidity risk classification interface |
| `financial_status.py` | Financial Status | Bankruptcy prediction with financial statement inputs |

---

## Running an App

```bash
cd Streamlit

# Install dependencies (if not already installed)
pip install streamlit pandas numpy scikit-learn xgboost catboost

# Run any app
streamlit run credit_risk.py
```

The app will open at `http://localhost:8501`

---

## Architecture

Each Streamlit app follows the same pattern:

1. Load the corresponding trained model from `../Models/`
2. Render an input form with relevant feature fields
3. On submit, preprocess inputs and run model prediction
4. Display risk score, risk label, and visual indicators

---

## Status

**Legacy** - These apps are no longer actively maintained. The production risk prediction flow is:

```
React Frontend -> FastAPI Backend -> Trained Models (../Models/)
```

The Streamlit apps are useful for:
- Quick local model testing without starting the full stack
- Demonstrating individual risk modules in isolation
- Educational purposes for understanding model inputs/outputs
