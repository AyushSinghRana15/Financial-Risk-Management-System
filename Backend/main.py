import random
import hashlib  # For creating deterministic daily seeds via MD5 hash
from fastapi import FastAPI, Depends, HTTPException, Request
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware  # Controls which domains can call this API from a browser
from slowapi import Limiter, _rate_limit_exceeded_handler  # Rate limiting library to prevent abuse
from slowapi.util import get_remote_address  # Extracts client IP address for rate limiting
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session  # ORM session for database queries
from sqlalchemy import desc, select  # SQL helpers: desc = descending order, select = query builder
import concurrent.futures  # Thread pool for running multiple DB queries in parallel

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
from operational_risk_api import router as operational_router

# Env — loads .env file into environment variables (API keys, DB URL, etc.)
from dotenv import load_dotenv
load_dotenv()
import os

# Google OAuth — verifies Google login tokens from the frontend
from google.oauth2 import id_token  # Validates Google's signed JWT token
from google.auth.transport import requests  # HTTP transport for fetching Google's public keys

# AI Service — LLM-powered chatbot and portfolio insights via OpenRouter
from ai_service import get_ai_insights, chatbot_response

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# ================= DB =================
# Creates all database tables defined in models.py (if they don't exist yet)
Base.metadata.create_all(bind=engine)

# ================= APP =================
app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")

# Allowed origins for CORS — only these domains can call this API from a browser
allow_origins = [
    "https://finrisk.online",
    "https://www.finrisk.online",
    "http://localhost:5173",  # Vite React dev server
    "http://localhost:3000",  # Create React App dev server
]
if FRONTEND_URL:
    allow_origins.append(FRONTEND_URL)

# CORS middleware — without this, browsers block cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,  # Allows cookies/auth headers to be sent cross-origin
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # OPTIONS is the preflight request browsers send before real requests
    allow_headers=["*"],
)

# Rate limiting — prevents a single IP from spamming the API
limiter = Limiter(key_func=get_remote_address)  # Identifies clients by their IP address
app.state.limiter = limiter
# When rate limit is exceeded, return a 429 Too Many Requests instead of crashing
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Prevents browser from MIME-sniffing (e.g., treating a JS file as HTML)
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Prevents the site from being embedded in an iframe (clickjacking protection)
    response.headers["X-Frame-Options"] = "DENY"
    return response

app.include_router(portfolio_router)

# ================= DB DEPENDENCY =================
# FastAPI dependency that provides a database session per request
# The `yield` pattern ensures the session is closed after the request completes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================= ROUTERS =================
# Each router is a separate file with its own endpoints, organized by risk domain
app.include_router(credit_router)
app.include_router(market_router)
app.include_router(market_data_router)
app.include_router(fraud_router)
app.include_router(operational_router)
app.include_router(business_router)
app.include_router(liquidity_router, prefix="/liquidity")
app.include_router(financial_router, prefix="/financial")

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "ok", "message": "Financial Risk API running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "2.0.0",
        "services": {
            "database": "connected",
            "rate_limiting": "active",
            "security_headers": "enabled",
        },
    }

# ================= GOOGLE AUTH =================
# Uses Google's OAuth2 to let users sign in with their Google account
@app.post("/auth/google")
@limiter.limit("10/minute")  # Max 10 requests per minute per IP
def google_auth(request: Request, data: dict, db: Session = Depends(get_db)):
    credential = data.get("credential")
    
    if not credential:
        raise HTTPException(status_code=400, detail="No credential provided")
    
    try:
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        # verify_oauth2_token decrypts and validates Google's signed JWT
        # It checks: signature, expiry, audience (must match our CLIENT_ID)
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), CLIENT_ID)
        
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        
        print(f"Verified User: {email}")
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # First-time login — create a new user record
        user = User(
            name=name or email.split("@")[0],
            email=email,
            password_hash="google_oauth",  # Placeholder — auth is handled by Google, not us
            is_verified=True  # Google-verified users skip email verification
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Returning user — update name/picture in case they changed on Google
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
@limiter.limit("10/minute")
def update_profile(request: Request, data: dict, db: Session = Depends(get_db)):

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
# Aggregates key metrics for the user's dashboard in one call
# Uses ThreadPoolExecutor to run 4 DB queries concurrently instead of sequentially
@app.get("/dashboard/stats")
@limiter.limit("30/minute")
def get_dashboard_stats(request: Request, email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {
            "portfolio_value": 0,
            "credit_risk_score": None,
            "market_risk_level": None,
            "business_risk_score": None
        }

    uid = user.id

    # Each inner function opens its OWN session for thread-safe parallel execution
    def _portfolio():
        s = SessionLocal()
        try:
            rows = s.execute(
                select(Portfolio.quantity, Portfolio.current_price)
                .where(Portfolio.user_id == uid)
            ).all()
            # Total portfolio value = sum of (quantity × current_price) for all assets
            return sum((qty or 0) * (price or 0) for qty, price in rows)
        finally:
            s.close()

    def _credit():
        s = SessionLocal()
        try:
            return s.execute(
                select(CreditPrediction.risk_score, CreditPrediction.risk_label)
                .where(CreditPrediction.user_id == uid)
                .order_by(desc(CreditPrediction.id))  # Most recent first
                .limit(1)  # Only the latest prediction
            ).first()
        finally:
            s.close()

    def _market():
        s = SessionLocal()
        try:
            return s.execute(
                select(MarketRiskData.risk_score, MarketRiskData.risk_level)
                .where(MarketRiskData.user_id == uid)
                .order_by(desc(MarketRiskData.id))
                .limit(1)
            ).first()
        finally:
            s.close()

    def _business():
        s = SessionLocal()
        try:
            return s.execute(
                select(BusinessRisk.risk_score, BusinessRisk.risk_level)
                .where(BusinessRisk.user_id == uid)
                .order_by(desc(BusinessRisk.id))
                .limit(1)
            ).first()
        finally:
            s.close()

    # ThreadPoolExecutor runs all 4 queries in parallel (max 4 worker threads)
    # This is faster than running them one after another
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        fut_portfolio = pool.submit(_portfolio)
        fut_credit = pool.submit(_credit)
        fut_market = pool.submit(_market)
        fut_business = pool.submit(_business)
        portfolio_value = fut_portfolio.result()
        latest_credit = fut_credit.result()
        latest_market = fut_market.result()
        latest_business = fut_business.result()

    return {
        "portfolio_value": portfolio_value,
        "credit_risk_score": latest_credit[0] * 100 if latest_credit else None,
        "credit_risk_label": latest_credit[1] if latest_credit else None,
        "market_risk_level": latest_market[1] if latest_market else None,
        "market_risk_score": latest_market[0] * 100 if latest_market else None,
        "business_risk_score": latest_business[0] * 100 if latest_business else None,
        "business_risk_label": latest_business[1] if latest_business else None,
    }


# ================= AI INSIGHTS (Portfolio Based) =================
# Demo endpoint — sends a hardcoded portfolio to the AI service for analysis
@app.get("/ai-insights")
def ai_insights(db: Session = Depends(get_db)):
    portfolio = [
        {"asset": "AAPL", "type": "stock", "qty": 10, "price": 150},
        {"asset": "BTC", "type": "crypto", "qty": 0.5, "price": 30000}
    ]

    result = get_ai_insights(portfolio)
    return result

# ================= AI RISK ALERTS (Prompt Based) =================
# Works with both GET (page load) and POST (user submits a prompt)
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
# AI-powered financial advisor that has context of the user's portfolio and all risk scores
@app.post("/api/chatbot")
@limiter.limit("20/minute")
def chatbot_chat(request: Request, data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "")
    user_message = data.get("message", "")
    history = data.get("history", [])  # Previous conversation turns

    context_parts = []

    # Fetch user
    user = db.query(User).filter(User.email == email).first() if email else None

    if user:
        # Portfolio
        portfolio_assets = db.query(Portfolio).filter(Portfolio.user_id == user.id).all()
        if portfolio_assets:
            portfolio_str = "\n".join([
                f"- {a.asset_name} ({a.asset_type}): {a.quantity} shares, buy price ₹{a.buy_price}, current ₹{a.current_price}, value ₹{a.quantity * a.current_price}"
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
            l_ratio = (latest_liquidity.assets / latest_liquidity.liabilities) if latest_liquidity.liabilities else 0
            context_parts.append(f"LIQUIDITY RISK: Score {latest_liquidity.risk_score*100:.1f}%, Ratio: {l_ratio:.2f}")

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

    # System prompt tells the AI what role to play and what data is available
    system_prompt = f"""You are FinRisk AI, a financial risk advisory assistant for the FinRisk platform.

You have access to the user's portfolio and risk prediction data below. Use it to answer their questions concisely and helpfully.

USER DATA:
{context_str}

Guidelines:
- Be concise and direct. Use bullet points when helpful.
- Provide specific financial insights based on the data.
- If asked about something not in the data, say you can only advise on available portfolio/risk data.
- For portfolio advice, consider diversification (spreading across assets), concentration risk (over-reliance on one asset), and asset allocation (how money is split across stocks/crypto/etc).
- For risk scores, explain what they mean in simple terms.
- Keep responses under 150 words unless complex analysis is needed.
- Do NOT make up data or numbers not provided in the context above.
- You can suggest general financial best practices when relevant.
- Be friendly but professional."""

    # Send system prompt + conversation history to the LLM
    response_text = chatbot_response(system_prompt, history + [{"role": "user", "content": user_message}])
    return {"response": response_text}


# =====================================================================
# NOTIFICATIONS — dynamic, session‑aware, with message template variety
# =====================================================================

TIME_TIPS = [
    "Review your portfolio before major economic announcements this week.",
    "Consider rebalancing if any single asset exceeds 40 % of your portfolio.",
    "Run a market risk scan after significant index movements.",
    "Add stop‑loss alerts for your highest‑volatility positions.",  # stop-loss: automatic sell if price drops below a threshold
    "Schedule a weekly risk review to stay ahead of exposure changes.",
    "Check your liquidity ratio if you plan new capital deployments.",  # liquidity ratio: ability to cover short-term debts
    "Diversify across uncorrelated asset classes to lower overall VaR.",  # VaR (Value at Risk): max expected loss over a period
    "Monitor credit spreads if you hold corporate bonds or loans.",  # credit spread: difference between corporate and risk-free bond yields
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
    but stay consistent within the same day (avoids flickering).
    Same user + same date = same seed, so notifications don't shuffle on every page load."""
    date_tag = datetime.now().strftime("%Y-%m-%d")
    raw = f"{user_id}-{date_tag}"
    # MD5 hash of user+date converted to a large integer to use as random seed
    return int(hashlib.md5(raw.encode()).hexdigest(), 16)


def _pick(templates, seed, key=None):
    """Pick a random template variant using the daily seed.
    seed % len(pool) gives a deterministic index that changes daily per user."""
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
            top_weight = (top_value / total_value) * 100  # Percentage of portfolio in the biggest asset
            asset_type_count = sum(1 for v in value_by_type.values() if v > 0)

            if top_weight >= 50:
                # Concentration risk: too much money in one asset is dangerous
                conc_msgs = [
                    f"{top_name} is {top_weight:.0f}% of your portfolio — consider trimming to reduce concentration risk.",
                    f"Concentration alert: {top_name} weighs {top_weight:.0f}%. Diversify to lower single‑asset exposure.",
                    f"{top_weight:.0f}% of your portfolio sits in {top_name}. Spread risk across more positions.",
                ]
                add(conc_msgs[seed % len(conc_msgs)], "warning")
            elif asset_type_count >= 3:
                # Unsystematic risk: risk specific to one company/sector, reduced by diversification
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
                # PnL = Profit and Loss percentage (current value vs what was paid)
                pnl_pct = ((total_value - invested_value) / invested_value) * 100
                if pnl_pct >= 5:
                    # Cost basis = original purchase price; unrealised gain = profit on paper but not yet sold
                    gain_msgs = [
                        f"📈 Portfolio up {pnl_pct:.1f}% from cost basis. Lock in partial gains or let winners run.",
                        f"Unrealised gain of {pnl_pct:.1f}%. Consider tax‑efficient rebalancing.",
                        f"Your portfolio has gained {pnl_pct:.1f}% — review if target weights still hold.",
                    ]
                    add(gain_msgs[seed % len(gain_msgs)], "success")
                elif pnl_pct <= -5:
                    # Stop-loss: automatic sell order to limit losses; hedge: offset risk with another position
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
            add(_pick(BUSINESS_TEMPLATES, seed, "high").format(score=score), "warning", latest_business.created_at)
        elif score >= 40:
            add(_pick(BUSINESS_TEMPLATES, seed, "moderate").format(score=score), "info", latest_business.created_at)
        else:
            add(_pick(BUSINESS_TEMPLATES, seed, "low").format(score=score), "success", latest_business.created_at)

    # ---- liquidity risk ----
    if latest_liquidity and latest_liquidity.risk_score is not None:
        score = latest_liquidity.risk_score * 100
        ratio = (latest_liquidity.assets / latest_liquidity.liabilities) if latest_liquidity.liabilities else 0.0
        if score >= 70:
            add(_pick(LIQUIDITY_TEMPLATES, seed, "high").format(score=score, ratio=ratio), "warning", latest_liquidity.created_at)
        elif score >= 40:
            add(_pick(LIQUIDITY_TEMPLATES, seed, "moderate").format(score=score, ratio=ratio), "info", latest_liquidity.created_at)
        else:
            add(_pick(LIQUIDITY_TEMPLATES, seed, "low").format(score=score, ratio=ratio), "success", latest_liquidity.created_at)

    # ---- financial risk ----
    if latest_financial and latest_financial.risk_score is not None:
        score = latest_financial.risk_score * 100
        if score >= 70:
            add(_pick(FINANCIAL_TEMPLATES, seed, "high").format(score=score), "warning", latest_financial.created_at)
        elif score >= 40:
            add(_pick(FINANCIAL_TEMPLATES, seed, "moderate").format(score=score), "info", latest_financial.created_at)
        else:
            add(_pick(FINANCIAL_TEMPLATES, seed, "low").format(score=score), "success", latest_financial.created_at)

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
