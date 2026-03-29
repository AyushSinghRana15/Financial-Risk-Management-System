from fastapi import FastAPI, Depends
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

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
import os

# Google OAuth
from google.oauth2 import id_token
from google.auth.transport import requests

# AI Service
from ai_service import get_ai_insights

# Google Auth
from google.oauth2 import id_token
from google.auth.transport import requests

# Password Hashing
import bcrypt

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

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
    credential = data.get("credential")
    
    if not credential:
        return {"error": "No credential provided"}, 400
    
    try:
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), CLIENT_ID)
        
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        
        print(f"Verified User: {email}")
        
    except ValueError:
        return {"error": "Invalid token"}, 401
    
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            name=name or email.split("@")[0],
            email=email,
            password_hash="google_oauth",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = name or user.name
        user.picture = picture
        user.is_verified = True
        db.commit()
        db.refresh(user)

    return {
        "name": user.name,
        "email": user.email,
        "picture": picture
    }

# ================= EMAIL AUTH - SIGNUP =================
@app.post("/auth/signup")
def signup(data: dict, db: Session = Depends(get_db)):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not name or not email or not password:
        return {"error": "Name, email, and password are required"}, 400
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return {"error": "An account with this email already exists"}, 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    new_user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "name": new_user.name,
        "email": new_user.email
    }

# ================= EMAIL AUTH - LOGIN =================
@app.post("/auth/login")
def login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return {"error": "Email and password are required"}, 400
    
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return {"error": "No account found with this email"}, 401
    
    if user.password_hash == "google_oauth":
        return {"error": "This account was created using Google. Please sign in with Google."}, 401
    
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return {"error": "Invalid password"}, 401
    
    return {
        "name": user.name,
        "email": user.email,
        "picture": user.picture
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
    ).order_by(desc(CreditPrediction.id)).first()
    
    latest_market = db.query(MarketRiskData).filter(
        MarketRiskData.user_id == user.id
    ).order_by(desc(MarketRiskData.id)).first()
    
    latest_business = db.query(BusinessRisk).filter(
        BusinessRisk.user_id == user.id
    ).order_by(desc(BusinessRisk.id)).first()
    
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

    if isinstance(result, dict):
        insights = result.get("insights", [])
        suggestions = result.get("suggestions", [])
        
        overview = ". ".join(insights[:2]) if insights else "Analyzing portfolio..."
        recommendations = suggestions[:3] if suggestions else []
        
        return {
            "overview": overview,
            "recommendations": recommendations,
            "response": f"{overview}\n\nRecommendations:\n" + "\n".join([f"- {r}" for r in recommendations])
        }

    return {
        "overview": "Unable to analyze portfolio at this time.",
        "recommendations": [],
        "response": str(result)
    }


# ================= NOTIFICATIONS =================
@app.get("/notifications")
def get_notifications(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    
    notifications = []
    notification_id = 1
    
    if not user:
        return [
            {
                "id": 1,
                "text": "Welcome to FinRisk! Start by adding assets to your portfolio.",
                "type": "info",
                "timestamp": datetime.now().isoformat(),
                "read": False
            }
        ]
    
    # Fetch latest risk predictions
    latest_credit = db.query(CreditPrediction).filter(
        CreditPrediction.user_id == user.id
    ).order_by(desc(CreditPrediction.id)).first()
    
    latest_market = db.query(MarketRiskData).filter(
        MarketRiskData.user_id == user.id
    ).order_by(desc(MarketRiskData.id)).first()
    
    # Generate risk alerts
    if latest_credit and latest_credit.risk_score:
        risk_score = latest_credit.risk_score * 100
        if risk_score > 70:
            notifications.append({
                "id": notification_id,
                "text": f"High Credit Risk Alert: Your risk score is {risk_score:.1f}%",
                "type": "warning",
                "timestamp": latest_credit.predicted_at.isoformat() if latest_credit.predicted_at else datetime.now().isoformat(),
                "read": False
            })
            notification_id += 1
        elif risk_score > 40:
            notifications.append({
                "id": notification_id,
                "text": f"Moderate Credit Risk: Your risk score is {risk_score:.1f}%",
                "type": "info",
                "timestamp": latest_credit.predicted_at.isoformat() if latest_credit.predicted_at else datetime.now().isoformat(),
                "read": False
            })
            notification_id += 1
    
    if latest_market and latest_market.risk_score:
        risk_score = latest_market.risk_score * 100
        if risk_score > 5:
            notifications.append({
                "id": notification_id,
                "text": f"Market VaR Alert: Value at Risk exceeds {risk_score:.1f}%",
                "type": "warning",
                "timestamp": latest_market.recorded_at.isoformat() if latest_market.recorded_at else datetime.now().isoformat(),
                "read": False
            })
            notification_id += 1
        elif risk_score > 2:
            notifications.append({
                "id": notification_id,
                "text": f"Elevated Market Risk: VaR at {risk_score:.1f}%",
                "type": "info",
                "timestamp": latest_market.recorded_at.isoformat() if latest_market.recorded_at else datetime.now().isoformat(),
                "read": False
            })
            notification_id += 1
    
    # Get AI-powered advice notifications
    portfolio_assets = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
    if portfolio_assets:
        portfolio_data = [
            {"asset": a.asset_name, "type": a.asset_type, "qty": a.quantity, "price": a.current_price}
            for a in portfolio_assets
        ]
        
        try:
            ai_result = get_ai_insights(portfolio_data)
            if isinstance(ai_result, dict):
                insights = ai_result.get("insights", [])[:2]
                for insight in insights:
                    notifications.append({
                        "id": notification_id,
                        "text": insight,
                        "type": "success",
                        "timestamp": datetime.now().isoformat(),
                        "read": False
                    })
                    notification_id += 1
        except Exception as e:
            print(f"AI insights error: {e}")
    
    # If no notifications, add a default message
    if len(notifications) == 0:
        notifications.append({
            "id": 1,
            "text": "No risk alerts detected. Your portfolio looks stable!",
            "type": "success",
            "timestamp": datetime.now().isoformat(),
            "read": False
        })
    
    return notifications