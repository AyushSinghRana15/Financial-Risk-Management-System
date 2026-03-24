# Financial-Risk-Management-System
This project involves building a Machine Learning-driven Credit Risk Model designed to predict the risk level of individual credit applications.
# Current Structure
Directory structure:
└── ayushsinghrana15-financial-risk-management-system/
    ├── README.md
    ├── Backend/
    │   ├── business_risk_api.py
    │   ├── credit_risk_api.py
    │   ├── database.py
    │   ├── main.py
    │   ├── market_risk_api.py
    │   ├── models.py
    │   ├── operational_risk_api.py
    │   └── requirements.txt
    ├── Models/
    │   ├── balanced_logistic_model.pkl
    │   ├── business_risk_threshold.pkl
    │   ├── features.pkl
    │   ├── financial_selected_features.pkl
    │   ├── financial_threshold.pkl
    │   ├── operational_risk.pkl
    │   ├── scaler.pkl
    │   └── standard_scaler.pkl
    ├── React Frontend/
    │   ├── README.md
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package.json
    │   ├── postcss.config.js
    │   ├── tailwind.config.js
    │   ├── vite.config.js
    │   └── src/
    │       ├── App.css
    │       ├── App.jsx
    │       ├── index.css
    │       ├── main.jsx
    │       ├── components/
    │       │   ├── Navbar.jsx
    │       │   ├── NotificationPanel.jsx
    │       │   ├── ProfileSection.jsx
    │       │   ├── ProtectedRoute.jsx
    │       │   ├── RiskCard.jsx
    │       │   └── Sidebar.jsx
    │       ├── pages/
    │       │   ├── BusinessRisk.jsx
    │       │   ├── CreditRisk.jsx
    │       │   ├── Dashboard.jsx
    │       │   ├── FinancialRisk.jsx
    │       │   ├── LiquidityRisk.jsx
    │       │   ├── Login.jsx
    │       │   ├── MarketRisk.jsx
    │       │   ├── OperationalRisk.jsx
    │       │   ├── Portfolio.jsx
    │       │   ├── PortfolioAnalytics.jsx
    │       │   ├── Profile.jsx
    │       │   ├── RiskAnalytics.jsx
    │       │   └── Signup.jsx
    │       └── services/
    │           └── api.js
    └── Streamlit/
        ├── business_streamlit.py
        ├── credit_risk.py
        ├── financial_status.py
        ├── liquidity_risk.py
        ├── market_risk.py
        └── .ipynb_checkpoints/
            ├── credit_risk-checkpoint.py
            └── market_risk-checkpoint.py
