from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
import models

from business_risk_api import router as business_router
from credit_risk_api import router as credit_router
from E_commerce_fraud_risk_api import router as fraud_router
from market_risk_api import router as market_risk_router
from routes.market import router as market_data_router
from liquidity_risk_api import router as liquidity_router
from final_financial_api import router as financial_router  

from dotenv import load_dotenv
load_dotenv()

from ai_service import get_ai_insights

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= ROUTERS =================
app.include_router(credit_router)
app.include_router(market_risk_router)
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
def google_auth(data: dict):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.email == data.get("email")).first()

    if not user:
        user = User(
            username=data.get("name"),
            email=data.get("email"),
            password="google_oauth",   # dummy placeholder
            is_verified=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "name": user.username,
        "email": user.email
    }

# ================= PROFILE APIs =================
@app.get("/profile")
def get_profile():
    db: Session = SessionLocal()

    user = db.query(User).first()

    if not user:
        user = User(
            username="ayush",
            email="ayush@gmail.com",
            password="google_oauth",
            age=22,
            risk_profile="Medium"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "name": user.username,
        "email": user.email,
        "age": user.age,
        "risk_profile": user.risk_profile
    }


@app.put("/profile")
def update_profile(data: dict):
    db: Session = SessionLocal()

    user = db.query(User).first()

    if user:
        user.username = data.get("name")
        user.email = data.get("email")
        user.age = data.get("age")
        user.risk_profile = data.get("risk_profile")

        db.commit()
        db.refresh(user)

    return {"message": "Profile updated"}

# ================= AI INSIGHTS =================
@app.get("/ai-insights")
def ai_insights():
    db: Session = SessionLocal()

    user = db.query(User).first()

    portfolio = [
        {"asset": "AAPL", "type": "stock", "qty": 10, "price": 150},
        {"asset": "BTC", "type": "crypto", "qty": 0.5, "price": 30000}
    ]

    result = get_ai_insights(portfolio)

    return result