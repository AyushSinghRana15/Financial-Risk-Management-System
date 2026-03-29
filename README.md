# FinRisk: AI-Powered Financial Risk Management System

![Project Status](https://img.shields.io/badge/status-Production-brightgreen)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**FinRisk** is a state-of-the-art Financial Risk Management Dashboard that leverages machine learning and AI to provide real-time risk assessment, portfolio intelligence, and actionable recommendations. Designed with a premium glassmorphic UI, it helps investors and institutions monitor market volatility, credit risk, and liquidity exposures in a single unified interface.

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
| **Credit Risk** | ML-driven prediction of default probabilities |
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
├── Backend/                      # FastAPI Engine
│   ├── main.py                  # Application entry point
│   ├── ai_service.py            # OpenRouter AI integration
│   ├── database.py              # SQLAlchemy configuration
│   ├── models.py                # Database schemas
│   ├── portfolio.py              # Portfolio management API
│   ├── credit_risk_api.py       # Credit risk predictions
│   ├── market_risk_api.py       # Market/VaR calculations
│   ├── business_risk_api.py     # Business risk analysis
│   ├── liquidity_risk_api.py    # Liquidity assessment
│   ├── final_financial_api.py   # Financial risk module
│   ├── operational_risk_api.py  # Operational risk scoring
│   ├── E_commerce_fraud_risk_api.py  # Fraud detection
│   ├── requirements.txt          # Python dependencies
│   └── README.md                # Backend documentation
│
├── Models/                      # Trained ML Models (.pkl)
├── Notebooks/                   # Research & Model Training
├── React Frontend/              # React Dashboard
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── PortfolioAnalytics.jsx
│   │   │   ├── CreditRisk.jsx
│   │   │   ├── MarketRisk.jsx
│   │   │   ├── BusinessRisk.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── index.css           # Global styles
│   │   └── App.jsx            # Main application
│   ├── package.json
│   └── README.md
│
├── Streamlit/                   # Legacy Interactive Simulators
└── README.md                    # This file
```

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
