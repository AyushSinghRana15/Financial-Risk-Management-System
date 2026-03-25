from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from database import engine, Base
import models
import uuid
from passlib.context import CryptContext
from business_risk_api import router as business_router
from credit_risk_api import router as credit_router
from market_risk_api import router as market_router
from E_commerce_fraud_risk_api import router as fraud_router


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


# Create tables (optional)
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credit_router)
app.include_router(market_router)
app.include_router(fraud_router)
app.include_router(business_router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}
# ================= PROFILE APIs =================

@app.get("/profile")
def get_profile():
    db: Session = SessionLocal()

    user = db.query(User).first()

    if not user:
        user = User(
            username="ayush",
            email="ayush@gmail.com",
            password="test123",
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
# ================= AUTH APIs =================

@app.post("/signup")
def signup(data: dict):
    db: Session = SessionLocal()

    existing = db.query(User).filter(User.email == data.get("email")).first()
    if existing:
        return {"error": "Email already registered"}

    token = str(uuid.uuid4())

    new_user = User(
        username=data.get("name"),
        email=data.get("email"),
        password=data.get("password"),
        verification_token=token,
        is_verified=0
    )

    db.add(new_user)
    db.commit()

    # 🔥 TEMP: print instead of email
    print(f"Verify link: http://localhost:5173/verify/{token}")

    return {"message": "Verification link generated (check terminal)"}


@app.get("/verify/{token}")
def verify_email(token: str):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        return {"error": "Invalid token"}

    user.is_verified = 1
    user.verification_token = None
    db.commit()

    return {"message": "Email verified successfully"}


@app.post("/login")
def login(data: dict):
    db: Session = SessionLocal()

    user = db.query(User).filter(User.email == data.get("email")).first()

    if not user:
        return {"error": "User not found"}

    if user.is_verified == 0:
        return {"error": "Please verify your email first"}

    if user.password != data.get("password"):
        return {"error": "Invalid credentials"}

    return {
        "name": user.username,
        "email": user.email,
        "role": user.role
    }