from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from database import engine, Base
import models

from business_risk_api import router as business_router
from credit_risk_api import router as credit_router
from market_risk_api import router as market_router
from E_commerce_fraud_risk_api import router as fraud_router

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