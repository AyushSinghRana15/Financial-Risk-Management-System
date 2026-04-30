# Models - Trained ML Artifacts

This folder contains all serialized machine learning models, scalers, encoders, and threshold configurations used by the FinRisk backend APIs.

---

## Model Files

### Credit Risk Models

| File | Algorithm | Source Notebook | ROC-AUC | Description |
|------|-----------|-----------------|---------|-------------|
| `credit_risk_catboost.pkl` | CatBoost Classifier | `Credit Risk(main).ipynb` | 0.771 | Production credit default predictor |
| `credit_risk_xgboost_model.pkl` | XGBoost Classifier | `Credit Risk(main).ipynb` | 0.771 | Alternative credit default predictor |

### Market Risk Models

| File | Algorithm | Source Notebook | RMSE | Description |
|------|-----------|-----------------|------|-------------|
| `ml_var_model.pkl` | ML VaR Estimator | `Market Risk.ipynb` | 0.012 | Value-at-Risk prediction model |

### Business Risk Models

| File | Algorithm | Source Notebook | Accuracy | Description |
|------|-----------|-----------------|----------|-------------|
| `xgboost_business_risk_model.pkl` | XGBoost Classifier | `Business_risk.ipynb` | 96.1% | Business risk classification |
| `business_risk_threshold.pkl` | Threshold Config | `Business_risk.ipynb` | - | Optimized decision threshold |

### Operational Risk Models

| File | Algorithm | Source Notebook | Accuracy | Description |
|------|-----------|-----------------|----------|-------------|
| `op-risk_model.pkl` | Balanced Classifier | `operational_risk.ipynb` | 85.5% | Operational risk incident predictor |
| `operational_risk.pkl` | Operational Model | `operational_risk.ipynb` | - | Secondary operational risk model |

### Liquidity Risk Models

| File | Algorithm | Source Notebook | Accuracy | Description |
|------|-----------|-----------------|----------|-------------|
| `liquidity_model.pkl` | Multi-class Classifier | `liquidity_risk_project.ipynb` | 88.9% | 5-class liquidity risk classifier |

### Financial Status / Bankruptcy Models

| File | Algorithm | Source Notebook | Accuracy | Description |
|------|-----------|-----------------|----------|-------------|
| `final_financial_model.pkl` | Balanced Classifier | `final_financial_status.ipynb` | 97.3% | Bankruptcy prediction model |
| `financial_threshold.pkl` | Threshold Config | `final_financial_status.ipynb` | - | Optimal threshold (0.837) |
| `financial_selector.pkl` | Feature Selector | `final_financial_status.ipynb` | - | Feature selection pipeline |
| `financial_selected_features.pkl` | Feature List | `final_financial_status.ipynb` | - | Selected feature names |

### E-Commerce Fraud Models

| File | Algorithm | Description |
|------|-----------|-------------|
| `E_commerce_fraud_xgboost_model.pkl` | XGBoost Classifier | E-commerce transaction fraud detection |
| `E_commerce_encoders.pkl` | Encoders | Categorical feature encoders |
| `E_commerce_model_features.pkl` | Feature List | Expected feature names for fraud model |

---

## Preprocessing Artifacts

### Scalers

| File | Type | Used By |
|------|------|---------|
| `scaler.pkl` | StandardScaler | Credit risk, general models |
| `standard_scaler.pkl` | StandardScaler | Financial status model |

### Feature Metadata

| File | Description |
|------|-------------|
| `features.pkl` | Feature names for credit risk models |

### Balanced Models (Archive)

| File | Algorithm | Notes |
|------|-----------|-------|
| `balanced_logistic_model.pkl` | Logistic Regression | Balanced class version |
| `balanced_xgboost_model.pkl` | XGBoost | Balanced class version |

---

## Usage

Models are loaded by their respective API handlers in the Backend:

```python
import joblib

# Load model
model = joblib.load("credit_risk_catboost.pkl")

# Load scaler
scaler = joblib.load("scaler.pkl")

# Load threshold
with open("financial_threshold.pkl", "rb") as f:
    threshold = pickle.load(f)
```

---

## Notes

- All `.pkl` files are serialized with `joblib` or `pickle`
- Models were trained on Python 3.14 with scikit-learn 1.8.0
- Ensure matching library versions when loading models
- Threshold files store optimal classification cutoffs determined during validation
