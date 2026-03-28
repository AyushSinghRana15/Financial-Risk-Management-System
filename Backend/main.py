from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine, Base
from models import User

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

#portfolio_router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

app.include_router(portfolio_router)

# ================= CORS =================
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
@app.get("/profile")
def get_profile(db: Session = Depends(get_db)):
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
def update_profile(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).first()

    if user:
        user.username = data.get("name")
        user.email = data.get("email")
        user.age = data.get("age")
        user.risk_profile = data.get("risk_profile")

        db.commit()
        db.refresh(user)

    return {"message": "Profile updated"}

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