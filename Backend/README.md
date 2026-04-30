# Backend - FastAPI REST API

The backend serves as the core API layer for FinRisk, handling risk predictions, portfolio management, user authentication, and AI-powered insights.

---

## Tech Stack

- **Framework**: FastAPI 0.135.1
- **Database**: PostgreSQL (Neon serverless) via SQLAlchemy 2.0
- **ML Libraries**: XGBoost, CatBoost, scikit-learn, pandas, numpy
- **Authentication**: Google OAuth 2.0, bcrypt
- **AI Integration**: OpenRouter API (Gemini models)
- **Market Data**: yfinance for real-time prices
- **Server**: Uvicorn (dev), Gunicorn (production)

---

## Project Structure

```
Backend/
├── main.py                      # FastAPI app entry, CORS, routers, auth, notifications
├── database.py                  # SQLAlchemy engine & session setup
├── models.py                    # DB schemas (User, Portfolio, CreditPrediction, etc.)
├── ai_service.py                # OpenRouter API wrapper for AI insights
├── portfolio.py                 # Portfolio CRUD with yfinance price updates
├── migrate.py                   # Database migration & seed data
├── test_db.py                   # Test database utilities
│
├── credit_risk_api.py           # Credit risk prediction endpoint
├── market_risk_api.py           # Market risk / VaR endpoint
├── business_risk_api.py         # Business risk analysis endpoint
├── liquidity_risk_api.py        # Liquidity risk assessment endpoint
├── final_financial_api.py       # Financial status / bankruptcy prediction
├── operational_risk_api.py      # Operational risk scoring endpoint
├── E_commerce_fraud_risk_api.py # E-commerce fraud detection endpoint
│
├── routes/
│   └── market.py               # Market data endpoints
│
├── requirements.txt             # Python dependencies
├── render-build.sh             # Production build script
├── .env.example                # Environment variable template
└── venv/                       # Virtual environment (gitignored)
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google` | Google OAuth login/registration |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile?email=` | Get user profile |
| PUT | `/profile` | Update user profile (name, age, risk_profile) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats?email=` | Aggregated risk scores & portfolio value |
| GET | `/notifications?email=` | Risk alerts & AI insights notifications |

### AI Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/ai-insights` | Portfolio-based AI analysis |
| GET/POST | `/ai-risk-alerts` | Prompt-based risk alerts with recommendations |

### Risk Modules

#### Credit Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-credit` | Predict credit default risk from applicant data |

#### Market Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-market` | Calculate VaR and market risk level |

#### Business Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-business` | Assess business risk from financial metrics |

#### Liquidity Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/liquidity/predict` | Classify liquidity risk level |

#### Financial Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/financial/predict` | Predict bankruptcy/financial distress |

#### Operational Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-operational` | Score operational risk for transactions |

#### E-Commerce Fraud
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-fraud` | Detect fraudulent e-commerce transactions |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/portfolio/*` | Manage portfolio assets with live prices |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/market/*` | Real-time market data via yfinance |

---

## Database Models

- **User**: name, email, password_hash, age, risk_profile, picture, is_verified
- **Portfolio**: user_id, asset_name, asset_type, quantity, current_price, total_value
- **CreditPrediction**: user_id, risk_score, risk_label, predicted_at
- **MarketRiskData**: user_id, risk_level, risk_score, recorded_at
- **BusinessRisk**: user_id, risk_score, risk_level, analyzed_at

---

## Environment Variables

Create a `.env` file from `.env.example`:

```
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_CLIENT_ID=...
FRONTEND_URL=http://localhost:5173
```

---

## Quick Start

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
uvicorn main:app --reload --port 8000
```

API available at:
- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Deployment

Production deployment via Render using `render-build.sh`:

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```
