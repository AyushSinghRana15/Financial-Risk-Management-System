# FinRisk Backend: AI Assessment Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

The **FinRisk Backend** is a modular risk calculation engine built with **FastAPI**. It handles complex financial data processing, integrates real-time market feeds, and manages AI-driven narrative assessments for diversified investment portfolios.

---

## 🏗️ Architecture

The backend is structured into specialized risk-assessment handlers, each focusing on a unique dimension of financial exposure.

### **📂 Directory Overview**

| File | Purpose |
|------|---------|
| `main.py` | Entry point with Auth, Profile, Notifications, and Dashboard routers |
| `ai_service.py` | OpenRouter (Gemini) integration for portfolio analysis |
| `database.py` | SQLAlchemy engine with PostgreSQL (Neon Serverless) |
| `models.py` | Database schemas: User, Portfolio, CreditPrediction, MarketRiskData, BusinessRisk, etc. |
| `portfolio.py` | Asset tracking, yfinance integration for live prices |
| `migrate.py` | Database migration and seed data population |

### **🔧 Risk Module Handlers**

| Module | File | Description |
|--------|------|-------------|
| **Credit Risk** | `credit_risk_api.py` | Probability-of-Default (PD) using ML models |
| **Market Risk** | `market_risk_api.py` | Volatility and Value-at-Risk (VaR) |
| **E-Commerce Fraud** | `E_commerce_fraud_risk_api.py` | Transaction-level fraud scoring |
| **Business Risk** | `business_risk_api.py` | Revenue stability assessment |
| **Financial Risk** | `final_financial_api.py` | Capital structure analysis |
| **Liquidity Risk** | `liquidity_risk_api.py` | Cash-flow coverage analysis |
| **Operational Risk** | `operational_risk_api.py` | System/process failure risk |

---

## 🔐 Authentication

### **Google OAuth**
- Seamless identity via `google-auth-library`
- Endpoint: `POST /auth/google`

### **Email/Password**
- Secure signup/login with **Bcrypt** hashing
- Passwords stored as hashed strings in PostgreSQL

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Create account with name, email, password |
| `/auth/login` | POST | Authenticate and receive user profile |

---

## 🤖 AI Analytics Service

The `ai_service.py` component uses **OpenRouter** (Gemini) to generate narrative portfolio insights.

### **Endpoint**: `POST /ai-risk-alerts`

**Request:**
```json
{
  "prompt": "Analyze this portfolio: [...]"
}
```

**Response:**
```json
{
  "overview": "Your portfolio shows moderate diversification with...",
  "recommendations": ["Diversify into bonds", "Monitor crypto exposure"],
  "response": "Full text response..."
}
```

---

## 📡 API Endpoints Catalog

### **Authentication**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google` | POST | Google OAuth authentication |
| `/auth/signup` | POST | Email/password registration |
| `/auth/login` | POST | Email/password login |

### **Dashboard**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard/stats` | GET | Portfolio value, risk scores overview |

### **Portfolio Management**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/portfolio/get/{email}` | GET | Fetch user's portfolio assets |
| `/portfolio/add` | POST | Add new asset to portfolio |

### **Risk Assessments**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict/credit` | POST | Credit risk prediction |
| `/predict/market` | POST | Market risk/VaR calculation |
| `/predict/fraud` | POST | E-commerce fraud detection |

### **AI & Notifications**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai-risk-alerts` | POST | AI portfolio analysis |
| `/notifications` | GET | Get user notifications |

### **Market Data**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/market/stock/{symbol}` | GET | Live stock price |
| `/market/search` | GET | Search market symbols |

> **Full API Documentation**: Visit `/docs` (Swagger UI) or `/redoc` when server is running.

---

## 🗄️ Database Schema

### **User**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR | Full name |
| email | VARCHAR | Unique email |
| password_hash | VARCHAR | Bcrypt hash or "google_oauth" |
| is_verified | BOOLEAN | Email verification status |
| age | INTEGER | User age |
| risk_profile | VARCHAR | Risk tolerance level |

### **Portfolio**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to User |
| asset_name | VARCHAR | Asset symbol/name |
| asset_type | VARCHAR | Stock, Crypto, Bond, ETF, etc. |
| quantity | FLOAT | Number of units |
| buy_price | FLOAT | Purchase price |
| current_price | FLOAT | Live market price |

---

## 🛠️ Installation & Setup

### **1. Environment Variables**
Create a `.env` file in the Backend directory:
```bash
DATABASE_URL=postgresql://user:password@host/dbname
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### **2. Install Dependencies**
```bash
cd Backend
pip install -r requirements.txt
```

### **3. Run Server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 👥 Contributors

Developed by the **FinRisk Team**:
- **Ayush Singh**
- **Aditya Singh**
- **Abhishek Kumar**
- **Bipin Singh**

**Mentor**: Mr. Alen Alexander
