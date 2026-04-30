# FinRisk: AI-Powered Financial Risk Management System

![Project Status](https://img.shields.io/badge/status-Production-brightgreen)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**FinRisk** is a state-of-the-art Financial Risk Management Dashboard that leverages machine learning and AI to provide real-time risk assessment, portfolio intelligence, and actionable recommendations. Designed with a premium glassmorphic UI, it helps investors and institutions monitor market volatility, business risk, liquidity exposures, and more in a single unified interface.

---

## 🎯 Overview

FinRisk transforms complex financial data into actionable insights through:

- **AI-Powered Intelligence**: Holistic portfolio analysis with narrative overviews and specific actionable recommendations generated via Gemini (OpenRouter).
- **Multi-Module Risk Tracking**: Six specialized risk modules covering every dimension of financial exposure.
- **Dynamic Portfolio Management**: Real-time asset tracking with live price updates from yfinance.
- **Premium User Experience**: Aurora-style animated backgrounds, glassmorphism UI, and smooth page transitions.
- **Secure Authentication**: Integrated Google OAuth and traditional Email/Password login.
- **Instant Notifications**: Real-time alerts for critical risk movements.

---

## ✨ Key Features

### **📊 Risk Modules**

| Module | Description |
|--------|-------------|
| **Credit Risk** | ML-driven default prediction using XGBoost/CatBoost with probability-based thresholds (Low/Medium/High risk tiers) |
| **Market Risk** | Value-at-Risk (VaR) estimation and volatility tracking |
| **Business Risk** | Revenue stability and competitive landscape assessment |
| **Operational Risk** | Monitoring of system-wide failures and process risks |
| **Financial Risk** | Capital structure and leverage analysis |
| **Liquidity Risk** | Cash-flow stability and funding risk assessment |
| **E-Commerce Fraud** | Transaction-level fraud detection for digital payments |

### **🤖 AI Intelligence**

- Portfolio Overview: 2-3 sentence narrative analysis
- Actionable Recommendations: Prioritized steps to improve portfolio health
- Risk Alerts: Proactive notifications for critical movements

### **📈 Portfolio Tracking**

- Real-time price updates via yfinance
- Asset allocation visualization (Pie charts)
- Performance tracking with P/L calculations
- Correlation matrix for diversification analysis

---

## 🛠️ Technical Stack

### **Frontend**
| Technology | Purpose |
|------------|---------|
| React 19 + Vite | Modern reactive UI framework |
| Tailwind CSS | Utility-first styling |
| Recharts | Data visualization (charts, graphs) |
| Lucide React | Consistent icon library |
| Framer Motion | Smooth page transitions |
| Axios | HTTP client for API calls |

### **Backend**
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance Python web framework |
| SQLAlchemy | Database ORM |
| PostgreSQL (Neon) | Serverless cloud database |
| OpenRouter API | AI-powered analysis (Gemini) |
| Google OAuth | Secure authentication |
| Bcrypt | Password hashing |
| yfinance | Real-time market data |

---

## 📂 Project Structure

```
FinRisk/
│
├── Backend/                          # FastAPI REST API
│   ├── main.py                       # App entry, CORS, routers
│   ├── ai_service.py                 # OpenRouter AI integration
│   ├── database.py                   # SQLAlchemy engine setup
│   ├── models.py                    # User, Portfolio, Risk schemas
│   ├── portfolio.py                  # Portfolio CRUD operations
│   │
│   ├── credit_risk_api.py           # Credit risk ML predictions
│   ├── market_risk_api.py           # VaR calculations
│   ├── business_risk_api.py          # Business risk analysis
│   ├── liquidity_risk_api.py         # Liquidity assessment
│   ├── final_financial_api.py        # Financial risk module
│   ├── operational_risk_api.py       # Operational risk scoring
│   ├── E_commerce_fraud_risk_api.py  # Fraud detection
│   │
│   ├── migrate.py                   # DB migration & seeding
│   ├── routes/                      # API route handlers
│   │   └── market.py               # Market data endpoints
│   │
│   ├── .env                        # Environment variables
│   ├── requirements.txt             # Python dependencies
│   ├── test_db.py                   # Test database utilities
│   └── README.md                   # Backend documentation
│
├── Models/                           # Trained ML Models
│   ├── credit_risk_catboost.pkl    # Credit risk CatBoost model (production)
│   ├── credit_risk_xgboost_model.pkl # Credit risk XGBoost model
│   ├── fraud_detection_model.pkl    # Fraud detection model
│   └── ...
│
├── Notebooks/                        # Research & Training
│   ├── Credit Risk(main).ipynb    # CatBoost credit risk training
│   ├── Credit Risk 2.ipynb          # Additional analysis
│   ├── Fraud_Detection.ipynb       # Fraud model training
│   └── ...
│
├── React Frontend/                   # React Dashboard
│   ├── public/
│   │   └── vite.svg               # Vite default logo (unused)
│   │
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   ├── Sidebar.jsx        # Collapsible sidebar nav
│   │   │   ├── NotificationPanel.jsx  # Notifications dropdown
│   │   │   ├── ProtectedRoute.jsx  # Auth guard component
│   │   │   └── ProfileSection.jsx # User profile page
│   │   │
│   │   ├── pages/                # Application pages
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── Portfolio.jsx      # Portfolio management
│   │   │   ├── PortfolioAnalytics.jsx  # Analytics & charts
│   │   │   ├── Market.jsx        # Market data viewer
│   │   │   ├── About.jsx         # About & tech stack
│   │   │   ├── Login.jsx         # Auth page
│   │   │   ├── Settings.jsx      # User settings
│   │   │   │
│   │   │   └── risk/            # Risk prediction pages
│   │   │       ├── CreditRisk.jsx
│   │   │       ├── MarketRisk.jsx
│   │   │       ├── BusinessRisk.jsx
│   │   │       ├── LiquidityRisk.jsx
│   │   │       ├── FinancialRisk.jsx
│   │   │       ├── OperationalRisk.jsx
│   │   │       └── ECommerceFraudRisk.jsx
│   │   │
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx            # React entry point
│   │   └── index.css          # Global styles & animations
│   │
│   ├── index.html               # HTML entry point
│   ├── package.json             # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind theme config
│   ├── postcss.config.js        # PostCSS for Tailwind
│   └── README.md               # Frontend documentation
│
├── Streamlit/                       # Legacy Interactive Apps
│   ├── app.py                    # Risk simulator
│   └── requirements.txt
│
├── README.md                       # Project documentation
└── .gitignore                     # Git ignore rules
```

### **Frontend File Details**

| File | Purpose |
|------|---------|
| `App.jsx` | Main app with React Router, DashboardLayout wrapper |
| `index.css` | Global styles: glassmorphism, animations, scrollbar styling |
| `Navbar.jsx` | Top bar with nav links, notifications, user menu |
| `Sidebar.jsx` | Collapsible sidebar with lucide icons |
| `Dashboard.jsx` | KPI cards, charts, portfolio intelligence |
| `Portfolio.jsx` | Asset management with add/edit/delete |
| `PortfolioAnalytics.jsx` | Charts: allocation, performance, correlation |
| `Login.jsx` | Google OAuth + email/password auth |
| `Risk pages` | Individual ML-powered risk prediction forms |

### **Backend File Details**

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, routers for all modules |
| `ai_service.py` | OpenRouter API wrapper for AI analysis |
| `database.py` | SQLAlchemy SessionLocal, engine creation |
| `models.py` | User, Portfolio, CreditPrediction, MarketRiskData, BusinessRisk schemas |
| `portfolio.py` | Portfolio CRUD with yfinance price updates |
| `*_api.py` | Individual risk module API handlers |

---

## 🚀 Quick Start

### **1. Backend Setup**

```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create .env file with:
#   DATABASE_URL=postgresql://...
#   OPENROUTER_API_KEY=sk-or-v1-...
#   GOOGLE_CLIENT_ID=...

# Run server
uvicorn main:app --reload --port 8000
```

Backend will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

### **2. Frontend Setup**

```bash
cd "React Frontend"

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 👥 Development Team

### **Contributors**
- **Ayush Singh** - Full-stack development, ML integration
- **Aditya Singh** - Backend architecture, API design
- **Abhishek Kumar** - Data analysis, model training
- **Bipin Singh** - Frontend UI/UX, visualization

### **Mentor**
**Mr. Alen Alexander**

---

## 📄 License

This project is for educational and research purposes in financial risk modeling.

---

## 🙏 Acknowledgments

- **OpenRouter** for AI model access
- **Neon Database** for serverless PostgreSQL
- **Google Cloud** for OAuth authentication
- **yfinance** for real-time market data
