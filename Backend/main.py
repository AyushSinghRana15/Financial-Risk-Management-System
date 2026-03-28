from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models import User, Portfolio, CreditPrediction, MarketRiskData, BusinessRisk

# Routers
from business_risk_api import router as business_router
from credit_risk_api import router as credit_router
from market_risk_api import router as market_router
from liquidity_risk_api import router as liquidity_router
from final_financial_api import router as financial_router
from routes.market import router as market_data_router
from E_commerce_fraud_risk_api import router as fraud_router
from portfolio import router as portfolio_router

# Env
from dotenv import load_dotenv
load_dotenv()

# AI Service
from ai_service import get_ai_insights

# ================= DB =================
Base.metadata.create_all(bind=engine)

# ================= APP =================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router)

# ================= DB DEPENDENCY =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= ROUTERS =================
app.include_router(credit_router)
app.include_router(market_router)
app.include_router(market_data_router)
app.include_router(fraud_router)
app.include_router(business_router)
app.include_router(liquidity_router, prefix="/liquidity")
app.include_router(financial_router, prefix="/financial")

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}

# ================= GOOGLE AUTH =================
@app.post("/auth/google")
def google_auth(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.get("email")).first()

    if not user:
        user = User(
            name=data.get("name"),
            email=data.get("email"),
            password_hash="google_oauth",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "name": user.name,
        "email": user.email
    }

# ================= PROFILE APIs =================
@app.put("/profile")
def update_profile(data: dict, db: Session = Depends(get_db)):

    email = data.get("email")

    user = db.query(User).filter(User.email == email).first()

    if user:
        user.name = data.get("name")
        user.age = data.get("age")
        user.risk_profile = data.get("risk_profile")

        db.commit()
        db.refresh(user)

    return {"message": "Profile updated"}

from fastapi import Query

@app.get("/profile")
def get_profile(email: str = Query(...), db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            name=email.split("@")[0],
            email=email,
            password_hash="google_oauth",
            age=22,
            risk_profile="Medium"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "name": user.name,
        "email": user.email,
        "age": user.age,
        "risk_profile": user.risk_profile
    }


# ================= DASHBOARD STATS =================
@app.get("/dashboard/stats")
def get_dashboard_stats(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {
            "portfolio_value": 0,
            "credit_risk_score": None,
            "market_risk_level": None,
            "business_risk_score": None
        }
    
    portfolio_assets = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
    portfolio_value = sum(a.total_value or 0 for a in portfolio_assets)
    
    latest_credit = db.query(CreditPrediction).filter(
        CreditPrediction.user_id == user.id
    ).order_by(CreditPrediction.predicted_at.desc()).first()
    
    latest_market = db.query(MarketRiskData).filter(
        MarketRiskData.user_id == user.id
    ).order_by(MarketRiskData.recorded_at.desc()).first()
    
    latest_business = db.query(BusinessRisk).filter(
        BusinessRisk.user_id == user.id
    ).order_by(BusinessRisk.recorded_at.desc()).first()
    
    return {
        "portfolio_value": portfolio_value,
        "credit_risk_score": latest_credit.risk_score * 100 if latest_credit else None,
        "credit_risk_label": latest_credit.risk_label if latest_credit else None,
        "market_risk_level": latest_market.risk_level if latest_market else None,
        "market_risk_score": latest_market.risk_score * 100 if latest_market else None,
        "business_risk_score": latest_business.risk_score * 100 if latest_business else None,
        "business_risk_label": latest_business.risk_level if latest_business else None
    }


# ================= AI INSIGHTS (Portfolio Based) =================
@app.get("/ai-insights")
def ai_insights(db: Session = Depends(get_db)):
    portfolio = [
        {"asset": "AAPL", "type": "stock", "qty": 10, "price": 150},
        {"asset": "BTC", "type": "crypto", "qty": 0.5, "price": 30000}
    ]

    result = get_ai_insights(portfolio)
    return result

# ================= AI RISK ALERTS (Prompt Based) =================
@app.post("/ai-risk-alerts")
def ai_risk_alerts(data: dict):
    prompt = data.get("prompt", "")

    result = get_ai_insights(prompt)

    # ✅ Convert structured response → alerts
    if isinstance(result, dict):
        alerts = []

        # from insights
        alerts.extend(result.get("insights", [])[:2])

        # from suggestions (optional)
        alerts.extend(result.get("suggestions", [])[:1])

        return {
            "response": "\n".join(alerts)
        }

    return {"response": str(result)}