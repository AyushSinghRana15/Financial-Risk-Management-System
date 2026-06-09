import random
import hashlib
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
from ai_service import get_ai_insights, chatbot_response

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# ================= DB =================
Base.metadata.create_all(bind=engine)

# ================= APP =================
app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")

allow_origins = [
    "https://finrisk.online",
    "https://www.finrisk.online",
    "http://localhost:5173",
    "http://localhost:3000",
]
if FRONTEND_URL:
    allow_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
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

# ================= CHATBOT ENDPOINT =================
@app.post("/api/chatbot")
def chatbot_chat(data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "")
    user_message = data.get("message", "")
    history = data.get("history", [])

    context_parts = []

    # Fetch user
    user = db.query(User).filter(User.email == email).first() if email else None

    if user:
        # Portfolio
        portfolio_assets = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        if portfolio_assets:
            portfolio_str = "\n".join([
                f"- {a.asset_name} ({a.asset_type}): {a.quantity} shares, buy price ₹{a.buy_price}, current ₹{a.current_price}, value ₹{a.total_value}"
                for a in portfolio_assets
            ])
            context_parts.append(f"PORTFOLIO:\n{portfolio_str}")
        else:
            context_parts.append("PORTFOLIO: User has no assets in their portfolio yet.")

        # Credit risk
        latest_credit = db.query(CreditPrediction).filter(
            CreditPrediction.user_id == user.id
        ).order_by(desc(CreditPrediction.id)).first()
        if latest_credit and latest_credit.risk_score is not None:
            context_parts.append(f"CREDIT RISK: Score {latest_credit.risk_score*100:.1f}%, Label: {latest_credit.risk_label or 'N/A'}")

        # Market risk
        latest_market = db.query(MarketRiskData).filter(
            MarketRiskData.user_id == user.id
        ).order_by(desc(MarketRiskData.id)).first()
        if latest_market and latest_market.risk_score is not None:
            context_parts.append(f"MARKET RISK: Symbol {latest_market.symbol or 'N/A'}, Score {latest_market.risk_score*100:.1f}%, Level: {latest_market.risk_level or 'N/A'}")

        # Business risk
        latest_business = db.query(BusinessRisk).filter(
            BusinessRisk.user_id == user.id
        ).order_by(desc(BusinessRisk.id)).first()
        if latest_business and latest_business.risk_score is not None:
            context_parts.append(f"BUSINESS RISK: Score {latest_business.risk_score*100:.1f}%, Level: {latest_business.risk_level or 'N/A'}")

        # Liquidity risk
        latest_liquidity = db.query(LiquidityRisk).filter(
            LiquidityRisk.user_id == user.id
        ).order_by(desc(LiquidityRisk.id)).first()
        if latest_liquidity and latest_liquidity.risk_score is not None:
            context_parts.append(f"LIQUIDITY RISK: Score {latest_liquidity.risk_score*100:.1f}%, Ratio: {latest_liquidity.liquidity_ratio or 0:.2f}")

        # Financial risk
        latest_financial = db.query(FinancialRisk).filter(
            FinancialRisk.user_id == user.id
        ).order_by(desc(FinancialRisk.id)).first()
        if latest_financial and latest_financial.risk_score is not None:
            context_parts.append(f"FINANCIAL RISK: Score {latest_financial.risk_score*100:.1f}%, Label: {latest_financial.risk_label or 'N/A'}")

        # Fraud detection
        latest_fraud = db.query(FraudPrediction).filter(
            FraudPrediction.user_id == user.id
        ).order_by(desc(FraudPrediction.id)).first()
        if latest_fraud and latest_fraud.fraud_probability is not None:
            context_parts.append(f"FRAUD DETECTION: Probability {latest_fraud.fraud_probability*100:.1f}%, Method: {latest_fraud.payment_method or 'N/A'}")

    context_str = "\n\n".join(context_parts) if context_parts else "No user data available."

    system_prompt = f"""You are FinRisk AI, a financial risk advisory assistant for the FinRisk platform.

You have access to the user's portfolio and risk prediction data below. Use it to answer their questions concisely and helpfully.

USER DATA:
{context_str}

Guidelines:
- Be concise and direct. Use bullet points when helpful.
- Provide specific financial insights based on the data.
- If asked about something not in the data, say you can only advise on available portfolio/risk data.
- For portfolio advice, consider diversification, concentration risk, and asset allocation.
- For risk scores, explain what they mean in simple terms.
- Keep responses under 150 words unless complex analysis is needed.
- Do NOT make up data or numbers not provided in the context above.
- You can suggest general financial best practices when relevant.
- Be friendly but professional."""

    response_text = chatbot_response(system_prompt, history + [{"role": "user", "content": user_message}])
    return {"response": response_text}


# =====================================================================
# NOTIFICATIONS — dynamic, session‑aware, with message template variety
# =====================================================================

TIME_TIPS = [
    "Review your portfolio before major economic announcements this week.",
    "Consider rebalancing if any single asset exceeds 40 % of your portfolio.",
    "Run a market risk scan after significant index movements.",
    "Add stop‑loss alerts for your highest‑volatility positions.",
    "Schedule a weekly risk review to stay ahead of exposure changes.",
    "Check your liquidity ratio if you plan new capital deployments.",
    "Diversify across uncorrelated asset classes to lower overall VaR.",
    "Monitor credit spreads if you hold corporate bonds or loans.",
]

CREDIT_TEMPLATES = {
    "high": [
        "⚠️  Credit risk elevated at {score:.1f}% — review borrower exposure.",
        "High credit alert: score hit {score:.1f}%. Tighten lending criteria.",
        "Credit portfolio at {score:.1f}% risk. Consider hedging strategies.",
    ],
    "moderate": [
        "Moderate credit risk at {score:.1f}%. Keep an eye on delinquencies.",
        "Credit score is {score:.1f}% — within watchlist territory.",
        "Credit risk creeping up to {score:.1f}%. Run a stress test soon.",
    ],
    "low": [
        "✅ Credit risk under control at {score:.1f}%.",
        "Low credit exposure ({score:.1f}%) — favourable conditions persist.",
        "Credit risk remains healthy at {score:.1f}%.",
    ],
}

MARKET_TEMPLATES = {
    "high": [
        "🚨 Market VaR spiked to {score:.1f}% for {symbol}. Hedge exposure.",
        "VaR alert: {symbol} at {score:.1f}%. Consider reducing position size.",
        "Elevated market risk detected — {symbol} VaR is {score:.1f}%.",
    ],
    "moderate": [
        "Market VaR at {score:.1f}% for {symbol} — above‑average volatility.",
        "{symbol} showing elevated risk ({score:.1f}% VaR). Watch closely.",
        "Moderate market risk: {symbol} VaR is {score:.1f}%.",
    ],
    "low": [
        "✅ Market risk contained at {score:.1f}% VaR for {symbol}.",
        "Low market volatility — {symbol} VaR is {score:.1f}%.",
        "Market conditions stable ({score:.1f}% VaR). No action needed.",
    ],
}

BUSINESS_TEMPLATES = {
    "high": [
        "⚠️  Business risk at {score:.1f}% — review revenue concentration.",
        "High business risk: {score:.1f}%. Diversify income streams.",
        "Revenue analysis flags {score:.1f}% business risk. Consider cost controls.",
    ],
    "moderate": [
        "Business risk moderate at {score:.1f}%. Monitor quarterly trends.",
        "Revenue analysis shows {score:.1f}% risk — within acceptable range.",
        "Business risk at {score:.1f}%. Keep overhead in check.",
    ],
    "low": [
        "✅ Business risk low at {score:.1f}%. Revenue outlook stable.",
        "Healthy business metrics — risk score is {score:.1f}%.",
        "Low business risk ({score:.1f}%). Good operational footing.",
    ],
}

LIQUIDITY_TEMPLATES = {
    "high": [
        "⚠️  Liquidity risk high ({score:.1f}%, ratio {ratio:.2f}). Boost cash reserves.",
        "Liquidity warning: {score:.1f}% risk. Evaluate short‑term obligations.",
        "Tight liquidity — {score:.1f}% risk, ratio {ratio:.2f}. Plan inflows.",
    ],
    "moderate": [
        "Liquidity at {score:.1f}% (ratio {ratio:.2f}). Maintain buffer.",
        "Moderate liquidity risk ({score:.1f}%). Review upcoming payables.",
        "Liquidity ratio {ratio:.2f} signals moderate exposure ({score:.1f}%).",
    ],
    "low": [
        "✅ Liquidity healthy at {score:.1f}% (ratio {ratio:.2f}).",
        "Strong liquidity position — {score:.1f}% risk, ratio {ratio:.2f}.",
        "Liquidity well‑managed at {score:.1f}% risk.",
    ],
}

FINANCIAL_TEMPLATES = {
    "high": [
        "⚠️  Financial risk high ({score:.1f}%) — reduce leverage.",
        "Debt‑to‑asset analysis: {score:.1f}% risk. Consider deleveraging.",
        "High financial risk at {score:.1f}%. Review debt structure.",
    ],
    "moderate": [
        "Financial risk moderate at {score:.1f}%. Watch debt ratios.",
        "Debt‑to‑asset score is {score:.1f}% — within range.",
        "Moderate financial risk ({score:.1f}%). Maintain current leverage.",
    ],
    "low": [
        "✅ Financial risk low at {score:.1f}%. Healthy balance sheet.",
        "Debt‑to‑asset metrics solid — {score:.1f}% risk.",
        "Low financial exposure ({score:.1f}%). Good capital structure.",
    ],
}

FRAUD_TEMPLATES = {
    "alert": [
        "🚨 Fraud alert: {probability:.1f}% on a {method} transaction.",
        "Suspicious {method} transaction — fraud probability {probability:.1f}%.",
        "High fraud risk ({probability:.1f}%) detected on {method}.",
    ],
    "safe": [
        "✅ Fraud check passed for recent {method} transaction.",
        "No fraud flags on latest {method} transaction ({probability:.1f}%).",
        "Transaction integrity confirmed — {method} at {probability:.1f}% fraud probability.",
    ],
}


def _daily_seed(user_id: int) -> int:
    """Deterministic seed per user per day so notifications vary daily
    but stay consistent within the same day (avoids flickering)."""
    date_tag = datetime.now().strftime("%Y-%m-%d")
    raw = f"{user_id}-{date_tag}"
    return int(hashlib.md5(raw.encode()).hexdigest(), 16)


def _pick(templates, seed, key=None):
    """Pick a random template variant using the daily seed."""
    pool = templates[key] if key else templates
    idx = seed % len(pool)
    return pool[idx]


def _time_greeting(dt: datetime = None) -> str:
    dt = dt or datetime.now()
    h = dt.hour
    if h < 12:
        return "morning"
    if h < 17:
        return "afternoon"
    return "evening"


@app.get("/notifications")
def get_notifications(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()

    notifications = []
    nid = 1

    def add(text, ntype="info", ts=None):
        nonlocal nid
        notifications.append({
            "id": nid,
            "text": text,
            "type": ntype,
            "timestamp": ts.isoformat() if hasattr(ts, "isoformat") else (ts or datetime.now().isoformat()),
            "read": False,
        })
        nid += 1

    if not user:
        return [{"id": 1, "text": "Welcome to FinRisk! Add assets to your portfolio to get started.", "type": "info", "timestamp": datetime.now().isoformat(), "read": False}]

    first_name = (user.name or user.email.split("@")[0]).split()[0]
    seed = _daily_seed(user.id)
    rng = random.Random(seed)

    # ---- time‑of‑day greeting ----
    add(f"Good {_time_greeting()}, {first_name}. Here is your risk snapshot for today.")

    # ---- risk‑profile intro ----
    if user.risk_profile:
        profile_lines = [
            f"Dashboard tuned for {user.risk_profile.lower()} risk profile — notifications reflect that threshold.",
            f"Your {user.risk_profile.lower()} risk profile shapes the alerts below.",
        ]
        add(profile_lines[seed % len(profile_lines)], "info", user.created_at)

    # ---- latest risk predictions ----
    latest_credit = db.query(CreditPrediction).filter(CreditPrediction.user_id == user.id).order_by(desc(CreditPrediction.id)).first()
    latest_market = db.query(MarketRiskData).filter(MarketRiskData.user_id == user.id).order_by(desc(MarketRiskData.id)).first()
    latest_business = db.query(BusinessRisk).filter(BusinessRisk.user_id == user.id).order_by(desc(BusinessRisk.id)).first()
    latest_liquidity = db.query(LiquidityRisk).filter(LiquidityRisk.user_id == user.id).order_by(desc(LiquidityRisk.id)).first()
    latest_financial = db.query(FinancialRisk).filter(FinancialRisk.user_id == user.id).order_by(desc(FinancialRisk.id)).first()
    latest_fraud = db.query(FraudPrediction).filter(FraudPrediction.user_id == user.id).order_by(desc(FraudPrediction.id)).first()
    portfolio_assets = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()

    # ---- portfolio notifications ----
    if not portfolio_assets:
        portfolio_msgs = [
            "No assets in your portfolio yet. Add positions to unlock concentration and diversification alerts.",
            "Your portfolio is empty — start by adding assets to receive personalised risk insights.",
            "Head to the portfolio page to add your first asset and begin tracking exposure.",
        ]
        add(portfolio_msgs[seed % len(portfolio_msgs)], "info", user.created_at)
    else:
        asset_values = []
        value_by_type = {}
        total_value = 0
        invested_value = 0
        for asset in portfolio_assets:
            cv = (asset.current_price or 0) * (asset.quantity or 0)
            bv = (asset.buy_price or 0) * (asset.quantity or 0)
            total_value += cv
            invested_value += bv
            asset_values.append((asset.asset_name or "Asset", cv))
            value_by_type[asset.asset_type or "Other"] = value_by_type.get(asset.asset_type or "Other", 0) + cv

        if total_value > 0:
            top_name, top_value = max(asset_values, key=lambda item: item[1])
            top_weight = (top_value / total_value) * 100
            asset_type_count = sum(1 for v in value_by_type.values() if v > 0)

            if top_weight >= 50:
                conc_msgs = [
                    f"{top_name} is {top_weight:.0f}% of your portfolio — consider trimming to reduce concentration risk.",
                    f"Concentration alert: {top_name} weighs {top_weight:.0f}%. Diversify to lower single‑asset exposure.",
                    f"{top_weight:.0f}% of your portfolio sits in {top_name}. Spread risk across more positions.",
                ]
                add(conc_msgs[seed % len(conc_msgs)], "warning")
            elif asset_type_count >= 3:
                div_msgs = [
                    f"Well diversified across {asset_type_count} asset classes — this reduces unsystematic risk.",
                    f"Your portfolio spans {asset_type_count} different asset types, which helps during sector‑specific downturns.",
                    f"✅ Good diversification ({asset_type_count} asset classes). Maintain this balance.",
                ]
                add(div_msgs[seed % len(div_msgs)], "success")
            else:
                conc_msgs = [
                    "Portfolio concentrated in just a few asset classes. Adding variety can lower overall risk.",
                    "Consider adding uncorrelated assets to improve diversification.",
                    "A more balanced asset mix would help reduce portfolio volatility.",
                ]
                add(conc_msgs[seed % len(conc_msgs)], "info")

            if invested_value > 0:
                pnl_pct = ((total_value - invested_value) / invested_value) * 100
                if pnl_pct >= 5:
                    gain_msgs = [
                        f"📈 Portfolio up {pnl_pct:.1f}% from cost basis. Lock in partial gains or let winners run.",
                        f"Unrealised gain of {pnl_pct:.1f}%. Consider tax‑efficient rebalancing.",
                        f"Your portfolio has gained {pnl_pct:.1f}% — review if target weights still hold.",
                    ]
                    add(gain_msgs[seed % len(gain_msgs)], "success")
                elif pnl_pct <= -5:
                    loss_msgs = [
                        f"📉 Portfolio down {abs(pnl_pct):.1f}% from cost. Check stop‑loss levels and downside exposure.",
                        f"Unrealised loss of {abs(pnl_pct):.1f}%. Evaluate whether fundamentals have changed.",
                        f"Portfolio declined {abs(pnl_pct):.1f}%. Review your risk tolerance and hedge if needed.",
                    ]
                    add(loss_msgs[seed % len(loss_msgs)], "warning")

    # ---- credit risk ----
    if latest_credit and latest_credit.risk_score is not None:
        score = latest_credit.risk_score * 100
        if score > 70:
            add(_pick(CREDIT_TEMPLATES, seed, "high").format(score=score), "warning", latest_credit.predicted_at)
        elif score > 40:
            add(_pick(CREDIT_TEMPLATES, seed, "moderate").format(score=score), "info", latest_credit.predicted_at)
        else:
            add(_pick(CREDIT_TEMPLATES, seed, "low").format(score=score), "success", latest_credit.predicted_at)

    # ---- market risk ----
    if latest_market and latest_market.risk_score is not None:
        score = latest_market.risk_score * 100
        symbol = latest_market.symbol or "latest asset"
        if score > 5:
            add(_pick(MARKET_TEMPLATES, seed, "high").format(score=score, symbol=symbol), "warning", latest_market.recorded_at)
        elif score > 2:
            add(_pick(MARKET_TEMPLATES, seed, "moderate").format(score=score, symbol=symbol), "info", latest_market.recorded_at)
        else:
            add(_pick(MARKET_TEMPLATES, seed, "low").format(score=score, symbol=symbol), "success", latest_market.recorded_at)

    # ---- business risk ----
    if latest_business and latest_business.risk_score is not None:
        score = latest_business.risk_score * 100
        if score >= 70:
            add(_pick(BUSINESS_TEMPLATES, seed, "high").format(score=score), "warning", latest_business.recorded_at)
        elif score >= 40:
            add(_pick(BUSINESS_TEMPLATES, seed, "moderate").format(score=score), "info", latest_business.recorded_at)
        else:
            add(_pick(BUSINESS_TEMPLATES, seed, "low").format(score=score), "success", latest_business.recorded_at)

    # ---- liquidity risk ----
    if latest_liquidity and latest_liquidity.risk_score is not None:
        score = latest_liquidity.risk_score * 100
        ratio = latest_liquidity.liquidity_ratio or 0.0
        if score >= 70:
            add(_pick(LIQUIDITY_TEMPLATES, seed, "high").format(score=score, ratio=ratio), "warning", latest_liquidity.recorded_at)
        elif score >= 40:
            add(_pick(LIQUIDITY_TEMPLATES, seed, "moderate").format(score=score, ratio=ratio), "info", latest_liquidity.recorded_at)
        else:
            add(_pick(LIQUIDITY_TEMPLATES, seed, "low").format(score=score, ratio=ratio), "success", latest_liquidity.recorded_at)

    # ---- financial risk ----
    if latest_financial and latest_financial.risk_score is not None:
        score = latest_financial.risk_score * 100
        if score >= 70:
            add(_pick(FINANCIAL_TEMPLATES, seed, "high").format(score=score), "warning", latest_financial.recorded_at)
        elif score >= 40:
            add(_pick(FINANCIAL_TEMPLATES, seed, "moderate").format(score=score), "info", latest_financial.recorded_at)
        else:
            add(_pick(FINANCIAL_TEMPLATES, seed, "low").format(score=score), "success", latest_financial.recorded_at)

    # ---- fraud detection ----
    if latest_fraud and latest_fraud.fraud_probability is not None:
        prob = latest_fraud.fraud_probability * 100
        method = latest_fraud.payment_method or "recent"
        if prob >= 50:
            add(_pick(FRAUD_TEMPLATES, seed, "alert").format(probability=prob, method=method), "alert", latest_fraud.predicted_at)
        else:
            add(_pick(FRAUD_TEMPLATES, seed, "safe").format(probability=prob, method=method), "success", latest_fraud.predicted_at)

    # ---- tip of the day (rotates daily) ----
    tip_index = seed % len(TIME_TIPS)
    add(f"💡 Tip: {TIME_TIPS[tip_index]}", "info")

    # ---- fallback if somehow still empty ----
    if len(notifications) <= 1:  # only the greeting exists
        welcome_msgs = [
            f"Welcome back, {first_name}. Run a risk model or add portfolio assets to see personalised alerts.",
            f"Hi {first_name}. No new risk signals yet — try a market or credit risk prediction.",
            f"Your dashboard is ready, {first_name}. Generate risk reports to populate alerts here.",
        ]
        add(welcome_msgs[seed % len(welcome_msgs)], "info")

    # ---- sort newest first, cap at 8 ----
    notifications.sort(key=lambda item: item["timestamp"], reverse=True)
    return notifications[:8]
