from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
<<<<<<< HEAD
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
=======
import uuid
from passlib.context import CryptContext
from dotenv import load_dotenv
from pydantic import BaseModel

# Routers
from business_risk_api import router as business_router
from credit_risk_api import router as credit_router
from market_risk_api import router as market_router
from liquidity_risk_api import router as liquidity_router
from final_financial_api import router as financial_router  

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ================= PASSWORD =================

def hash_password(password: str):
    return pwd_context.hash(password[:72])   # 🔥 FIX

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# ================= DB =================

Base.metadata.create_all(bind=engine)

# ================= APP =================
>>>>>>> 5dc00dc (Full stack project (FastAPI + React + Auth + Neon DB))

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
<<<<<<< HEAD
app.include_router(credit_router)
app.include_router(market_risk_router)
app.include_router(market_data_router)
app.include_router(fraud_router)
=======

app.include_router(credit_router)
app.include_router(market_router)
>>>>>>> 5dc00dc (Full stack project (FastAPI + React + Auth + Neon DB))
app.include_router(business_router)
app.include_router(liquidity_router, prefix="/liquidity")
app.include_router(financial_router, prefix="/financial")

<<<<<<< HEAD
# ================= ROOT =================
=======
>>>>>>> 5dc00dc (Full stack project (FastAPI + React + Auth + Neon DB))
@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}

<<<<<<< HEAD
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
=======
# ================= SCHEMAS =================
>>>>>>> 5dc00dc (Full stack project (FastAPI + React + Auth + Neon DB))

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

<<<<<<< HEAD
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
=======
class UserLogin(BaseModel):
    email: str
    password: str

# ================= AUTH =================

@app.post("/signup")
def signup(data: UserSignup):
    db: Session = SessionLocal()

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return {"error": "Email already registered"}

    token = str(uuid.uuid4())

    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        verification_token=token,
        is_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print(f"Verify link: http://localhost:5173/verify/{token}")

    return {"message": "Verification link generated"}

@app.post("/login")
def login(data: UserLogin):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"error": "User not found"}

    if not user.is_verified:
        return {"error": "Verify email first"}

    if not verify_password(data.password, user.password_hash):
        return {"error": "Invalid credentials"}

    return {
        "name": user.name,
        "email": user.email,
        "risk_profile": user.risk_profile
    }
>>>>>>> 5dc00dc (Full stack project (FastAPI + React + Auth + Neon DB))
