# Notebooks - Model Training & Research

This folder contains all Jupyter notebooks used for research, data exploration, feature engineering, and model training across the FinRisk financial risk management system.

---

## Notebooks Overview

| Notebook | Risk Domain | Models Trained | Best Metric |
|----------|-------------|----------------|-------------|
| `Credit Risk(main).ipynb` | Credit Default | XGBoost, CatBoost, LightGBM | AUC: 0.771 |
| `Credit Risk 2.ipynb` | Credit Default | XGBoost, LightGBM (tuned) | AUC: 0.772 |
| `Market Risk.ipynb` | Market/VaR | ML-based VaR Estimator | RMSE: 0.012 |
| `Business_risk.ipynb` | Business Risk | Random Forest, XGBoost | Accuracy: 96.1% |
| `operational_risk.ipynb` | Operational Risk | Logistic Regression, RF, XGBoost | Accuracy: 85.5% |
| `liquidity_risk_project.ipynb` | Liquidity Risk | Multi-class Classifier | Accuracy: 88.9% |
| `final_financial_status.ipynb` | Financial/Bankruptcy | Balanced Classifier | Accuracy: 97.3% |

---

## 1. Credit Risk Prediction

### Notebooks
- `Credit Risk(main).ipynb` - Primary training notebook
- `Credit Risk 2.ipynb` - Hyperparameter tuning & model comparison

### Dataset
- **Source**: Home Credit Default Risk (Kaggle)
- **Training**: 307,511 rows x 122 columns
- **Test**: 48,744 rows x 121 columns
- **Target**: Loan default (0 = Safe, 1 = Default)
- **Class Distribution**: ~93.9% safe, ~6.1% default (highly imbalanced)

### Models & Results

| Model | ROC-AUC | PR-AUC | Accuracy | Precision | Recall | F1 Score | Notes |
|-------|---------|--------|----------|-----------|--------|----------|-------|
| XGBoost | 0.7712 | 0.2608 | 0.88 | 0.30 | 0.32 | 0.31 | Baseline with threshold 0.65 |
| CatBoost | 0.7711 | 0.2602 | 0.85 | 0.25 | 0.44 | 0.32 | Best recall at threshold 0.30 |
| LightGBM | 0.7702 | 0.2591 | 0.86 | 0.26 | 0.40 | 0.31 | Fast training, competitive AUC |
| XGBoost + SMOTE | 0.7520 | - | 0.92 | 0.64 | 0.00 | 0.00 | SMOTE degraded minority recall |
| LightGBM (Tuned) | 0.7693 | - | - | - | - | - | GridSearchCV optimized |
| XGBoost (Tuned) | 0.7718 | - | - | - | - | - | Best params: depth=5, lr=0.03, n=800 |

### Risk Classification Thresholds
| Probability | Risk Level | Decision |
|-------------|-----------|----------|
| < 0.35 | Low Risk | Auto Approve |
| 0.35 - 0.65 | Medium Risk | Manual Review |
| > 0.65 | High Risk | Reject / Verify Further |

### Key Features
- EXT_SOURCE_1/2/3 (external credit bureau scores) - strongest predictors
- ANNUITY_CREDIT_RATIO, CREDIT_INCOME_RATIO
- Days employment, age, gender, asset ownership
- Loans > $1,000,000 receive +5% risk penalty

---

## 2. Market Risk (VaR Estimation)

### Notebook
- `Market Risk.ipynb`

### Objective
Predict Value-at-Risk (VaR) using machine learning instead of traditional parametric assumptions.

### Model Results
| Metric | Value |
|--------|-------|
| RMSE | 0.0121 |
| R² Score | -1.77 |

### Notes
- Negative R² indicates the ML model struggles to outperform a simple mean baseline for VaR prediction
- Traditional statistical VaR methods (historical, parametric) may be more reliable
- The notebook serves as exploratory research into ML-based VaR alternatives

---

## 3. Business Risk Assessment

### Notebook
- `Business_risk.ipynb`

### Objective
Classify companies into high/low business risk categories based on revenue stability, competitive landscape, and operational metrics.

### Model Results
| Model | Accuracy | Precision (Pos) | Recall (Pos) | F1 (Pos) |
|-------|----------|-----------------|--------------|----------|
| Random Forest | 96.1% | 0.43 | 0.59 | 0.50 |
| XGBoost | 96.3% | 0.48 | 0.55 | 0.51 |
| XGBoost (Tuned) | - | - | - | - |

### Notes
- High accuracy reflects class imbalance (majority low-risk)
- Precision for positive (high-risk) class remains moderate
- Threshold tuning applied to improve minority class detection
- GridSearchCV used for hyperparameter optimization

---

## 4. Operational Risk Prediction

### Notebook
- `operational_risk.ipynb`

### Objective
Predict operational risk incidents in financial transactions (system failures, process errors, fraud events).

### Features
- Transaction Type, Amount, Currency, Counterparty, Category

### Model Results
| Model | Accuracy | Macro F1 | Notes |
|-------|----------|----------|-------|
| Logistic Regression (original) | 100% | 1.00 | Data leakage / overfitting |
| Logistic Regression (balanced) | 85.5% | 0.46 | After fixing leakage |
| Random Forest | 83.5% | 0.47 | Default params |
| XGBoost (weighted) | 76.2% | 0.52 | Class-weighted |
| XGBoost (tuned) | 56.5% | 0.46 | Over-regularized |
| Balanced Logistic | 51.1% | 0.43 | Undersampled |

### Notes
- Initial 100% accuracy indicated data leakage, which was corrected
- Class imbalance (85.5% vs 14.5%) remains a challenge
- Optuna used for hyperparameter search
- Final production model uses balanced approach with macro F1 ~0.46

---

## 5. Liquidity Risk Classification

### Notebook
- `liquidity_risk_project.ipynb`

### Objective
Multi-class classification of liquidity risk levels for financial institutions.

### Class Distribution
| Class | Count | Description |
|-------|-------|-------------|
| 0 | 2,253 | Very Low Risk |
| 1 | 1,472 | Low Risk |
| 2 | 1,278 | Medium Risk |
| 3 | 79 | High Risk |
| 4 | 138 | Very High Risk |

### Model Results
| Metric | Value |
|--------|-------|
| Accuracy | 88.9% |
| Predicted Distribution | [0: 2184, 1: 1557, 2: 1231, 3: 91, 4: 157] |

### Notes
- 5-class multi-class problem
- Model captures overall distribution well
- Rare classes (3, 4) have limited samples but are predicted

---

## 6. Financial Status / Bankruptcy Prediction

### Notebook
- `final_financial_status.ipynb`

### Dataset
- 64 anonymized features (Attr1 - Attr64) from financial statements
- Target: Bankruptcy prediction (binary)
- Class Distribution: ~96% non-bankrupt, ~4% bankrupt

### Model Results
| Metric | Value |
|--------|-------|
| Accuracy | 97.3% |
| Precision (Bankrupt) | 0.74 |
| Recall (Bankrupt) | 0.52 |
| F1 (Bankrupt) | 0.61 |
| Macro Avg F1 | 0.80 |
| Optimal Threshold | 0.837 |

### Notes
- Balanced version trained to handle extreme class imbalance
- High threshold (0.837) reduces false positives
- Strong overall performance with reasonable minority class detection

---

## Common Patterns Across Models

### Challenges
1. **Class Imbalance**: All risk prediction tasks suffer from imbalanced classes
2. **Precision-Recall Tradeoff**: Improving recall for risk detection reduces precision
3. **Threshold Sensitivity**: Business context determines optimal classification threshold

### Techniques Used
- SMOTE for oversampling (limited success)
- Class weights / scale_pos_weight
- Threshold tuning on validation set
- GridSearchCV & Optuna for hyperparameter optimization
- Cross-validation (3-fold)

### Feature Engineering
- Financial ratios (annuity/credit, credit/income)
- External credit scores aggregation
- Temporal features (employment days, age)
- Transaction-based features for operational risk

---

## Output Artifacts

Trained models are saved to the `../Models/` directory:
- `credit_risk_catboost.pkl`, `credit_risk_xgboost_model.pkl`
- `ml_var_model.pkl`
- `xgboost_business_risk_model.pkl`, `business_risk_threshold.pkl`
- `op-risk_model.pkl`, `operational_risk.pkl`
- `liquidity_model.pkl`
- `final_financial_model.pkl`, `financial_threshold.pkl`
- `E_commerce_fraud_xgboost_model.pkl`

Scalers and encoders:
- `scaler.pkl`, `standard_scaler.pkl`
- `features.pkl`, `financial_selected_features.pkl`
- `E_commerce_encoders.pkl`, `E_commerce_model_features.pkl`
