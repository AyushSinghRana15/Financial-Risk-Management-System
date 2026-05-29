from fastapi import FastAPI, Depends, HTTPException
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import SessionLocal, engine, Base
from models import (
    User,
    Portfolio,
    CreditPrediction,
    MarketRiskData,
    BusinessRisk,
    LiquidityRisk,
    FinancialRisk,
    FraudPrediction,
)

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

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# ================= DB =================
Base.metadata.create_all(bind=engine)

# ================= APP =================
app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    FRONTEND_URL,
    "https://finrisk.online",
    "https://*.finrisk.online",
]
origins = [o for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://finrisk.online",
        "https://www.finrisk.online", # Add the www version just in case
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Explicitly allow OPTIONS
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
        raise HTTPException(status_code=400, detail="No credential provided")
    
    try:
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), CLIENT_ID)
        
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        
        print(f"Verified User: {email}")
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
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
@app.api_route("/ai-risk-alerts", methods=["GET", "POST"])
def ai_risk_alerts(data: dict = None):
    # Handle GET requests (triggered by page reloads/initial visits)
    if data is None:
        return {
            "overview": "System ready. Analysis will appear here when a prompt is provided.",
            "recommendations": [],
            "response": "Waiting for user input..."
        }

    prompt = data.get("prompt", "")

    # Call AI service with timeout handling
    result = get_ai_insights(prompt)

    if isinstance(result, dict):
        insights = result.get("insights", [])
        suggestions = result.get("suggestions", [])
        
        # Handle error or timeout
        if "error" in result or "timed out" in str(insights).lower():
            return {
                "overview": "AI analysis is taking longer than expected. Please refresh or try again.",
                "recommendations": [],
                "response": "Service temporarily unavailable."
            }
        
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

    def add_notification(text, type="info", timestamp=None):
        nonlocal notification_id
        notifications.append({
            "id": notification_id,
            "text": text,
            "type": type,
            "timestamp": timestamp.isoformat() if hasattr(timestamp, "isoformat") else (timestamp or datetime.now().isoformat()),
            "read": False
        })
        notification_id += 1

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

    first_name = (user.name or user.email.split("@")[0]).split()[0]

    # Fetch latest risk predictions
    latest_credit = db.query(CreditPrediction).filter(
        CreditPrediction.user_id == user.id
    ).order_by(desc(CreditPrediction.id)).first()

    latest_market = db.query(MarketRiskData).filter(
        MarketRiskData.user_id == user.id
    ).order_by(desc(MarketRiskData.id)).first()

    latest_business = db.query(BusinessRisk).filter(
        BusinessRisk.user_id == user.id
    ).order_by(desc(BusinessRisk.id)).first()

    latest_liquidity = db.query(LiquidityRisk).filter(
        LiquidityRisk.user_id == user.id
    ).order_by(desc(LiquidityRisk.id)).first()

    latest_financial = db.query(FinancialRisk).filter(
        FinancialRisk.user_id == user.id
    ).order_by(desc(FinancialRisk.id)).first()

    latest_fraud = db.query(FraudPrediction).filter(
        FraudPrediction.user_id == user.id
    ).order_by(desc(FraudPrediction.id)).first()

    portfolio_assets = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()

    if user.risk_profile:
        add_notification(
            f"{first_name}, your dashboard is tuned for a {user.risk_profile.lower()} risk profile.",
            "info",
            user.created_at
        )

    if not portfolio_assets:
        add_notification(
            "Add portfolio assets to unlock concentration, diversification, and exposure alerts.",
            "info",
            user.created_at
        )
    else:
        asset_values = []
        value_by_type = {}
        total_value = 0
        invested_value = 0

        for asset in portfolio_assets:
            current_value = (asset.current_price or 0) * (asset.quantity or 0)
            buy_value = (asset.buy_price or 0) * (asset.quantity or 0)
            total_value += current_value
            invested_value += buy_value
            asset_values.append((asset.asset_name or "Asset", current_value))
            value_by_type[asset.asset_type or "Other"] = value_by_type.get(asset.asset_type or "Other", 0) + current_value

        if total_value > 0:
            top_name, top_value = max(asset_values, key=lambda item: item[1])
            top_weight = (top_value / total_value) * 100
            asset_type_count = len([value for value in value_by_type.values() if value > 0])

            if top_weight >= 50:
                add_notification(
                    f"{top_name} makes up {top_weight:.0f}% of your portfolio. Consider reducing concentration risk.",
                    "warning"
                )
            elif asset_type_count >= 3:
                add_notification(
                    f"Your portfolio is spread across {asset_type_count} asset classes, which improves diversification.",
                    "success"
                )
            else:
                add_notification(
                    "Your portfolio is still concentrated in a few asset classes. Add variety to reduce risk.",
                    "info"
                )

            if invested_value > 0:
                pnl_percent = ((total_value - invested_value) / invested_value) * 100
                if pnl_percent >= 5:
                    add_notification(
                        f"Portfolio is up {pnl_percent:.1f}% from buy price. Review gains before rebalancing.",
                        "success"
                    )
                elif pnl_percent <= -5:
                    add_notification(
                        f"Portfolio is down {abs(pnl_percent):.1f}% from buy price. Check downside exposure.",
                        "warning"
                    )

    # Generate risk alerts from the user's latest model runs
    if latest_credit and latest_credit.risk_score:
        risk_score = latest_credit.risk_score * 100
        if risk_score > 70:
            add_notification(
                f"High credit risk alert: your latest score is {risk_score:.1f}%.",
                "warning",
                latest_credit.predicted_at
            )
        elif risk_score > 40:
            add_notification(
                f"Moderate credit risk: your latest score is {risk_score:.1f}%.",
                "info",
                latest_credit.predicted_at
            )
        else:
            add_notification(
                f"Credit risk is currently low at {risk_score:.1f}%.",
                "success",
                latest_credit.predicted_at
            )

    if latest_market and latest_market.risk_score:
        risk_score = latest_market.risk_score * 100
        if risk_score > 5:
            add_notification(
                f"Market VaR alert: {latest_market.symbol or 'latest asset'} risk is {risk_score:.1f}%.",
                "warning",
                latest_market.recorded_at
            )
        elif risk_score > 2:
            add_notification(
                f"Elevated market risk: VaR is {risk_score:.1f}% for {latest_market.symbol or 'your latest run'}.",
                "info",
                latest_market.recorded_at
            )
        else:
            add_notification(
                f"Market risk is contained at {risk_score:.1f}% VaR.",
                "success",
                latest_market.recorded_at
            )

    if latest_business and latest_business.risk_score is not None:
        risk_score = latest_business.risk_score * 100
        notification_type = "warning" if risk_score >= 70 else "info" if risk_score >= 40 else "success"
        add_notification(
            f"Business risk is {latest_business.risk_level or f'{risk_score:.1f}%'} based on your latest revenue analysis.",
            notification_type,
            latest_business.recorded_at
        )

    if latest_liquidity and latest_liquidity.risk_score is not None:
        risk_score = latest_liquidity.risk_score * 100
        notification_type = "warning" if risk_score >= 70 else "info" if risk_score >= 40 else "success"
        ratio_text = f" with ratio {latest_liquidity.liquidity_ratio:.2f}" if latest_liquidity.liquidity_ratio is not None else ""
        add_notification(
            f"Liquidity check: {latest_liquidity.risk_label or f'{risk_score:.1f}% risk'}{ratio_text}.",
            notification_type,
            latest_liquidity.recorded_at
        )

    if latest_financial and latest_financial.risk_score is not None:
        risk_score = latest_financial.risk_score * 100
        notification_type = "warning" if risk_score >= 70 else "info" if risk_score >= 40 else "success"
        add_notification(
            f"Financial risk is {latest_financial.risk_label or f'{risk_score:.1f}%'} from your latest debt-to-asset review.",
            notification_type,
            latest_financial.recorded_at
        )

    if latest_fraud and latest_fraud.fraud_probability is not None:
        fraud_score = latest_fraud.fraud_probability * 100
        notification_type = "alert" if fraud_score >= 50 else "success"
        add_notification(
            f"E-commerce fraud check: {latest_fraud.label or f'{fraud_score:.1f}% probability'} for a {latest_fraud.payment_method or 'recent'} transaction.",
            notification_type,
            latest_fraud.predicted_at
        )

    notifications.sort(key=lambda item: item["timestamp"], reverse=True)

    if len(notifications) == 0:
        add_notification(
            f"Welcome back, {first_name}. Run a risk model or add portfolio assets to receive personalized alerts.",
            "info"
        )

    return notifications[:8]
