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
from operational_risk_api import router as operational_router
from E_commerce_fraud_risk_api import router as fraud_router

# Create tables (optional)
# Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(credit_router)
app.include_router(market_router)
app.include_router(operational_router)
app.include_router(fraud_router)
app.include_router(business_router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}