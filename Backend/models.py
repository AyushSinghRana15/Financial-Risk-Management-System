from sqlalchemy import Column, Integer, String, Float, DateTime, Text, BigInteger, Boolean, ForeignKey
from sqlalchemy.sql import func  # Provides SQL functions like NOW() for default timestamps
from database import Base

# ================= USER =================
class User(Base):
    """Stores user account info — created via Google OAuth"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, nullable=False, index=True)  # Unique constraint + fast lookup
    password_hash = Column(String(255), nullable=False)  # Set to "google_oauth" for OAuth users

    age = Column(Integer, nullable=True)
    risk_profile = Column(String(20), nullable=True)  # "Low", "Medium", or "High" risk tolerance

    is_verified = Column(Boolean, default=False)  # Email verified (auto-true for Google OAuth)
    verification_token = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Auto-set on insert


# ================= PORTFOLIO =================
class Portfolio(Base):
    """Assets a user holds — stocks, crypto, etc."""
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Links to User table

    asset_name = Column(String)  # e.g., "AAPL", "BTC"
    asset_type = Column(String)  # e.g., "stock", "crypto", "etf"

    quantity = Column(Float)  # Number of shares/coins
    buy_price = Column(Float)  # Purchase price per unit
    current_price = Column(Float)  # Current market price per unit
    total_value = Column(Float)  # quantity * current_price (denormalized for fast queries)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= CREDIT =================
class CreditApplication(Base):
    """Raw credit application data before prediction"""
    __tablename__ = "credit_applications"

    id = Column(Integer, primary_key=True, index=True)
    income = Column(Float)
    credit = Column(Float)
    annuity = Column(Float)
    goods_price = Column(Float)
    children = Column(Integer)
    family_members = Column(Integer)
    age = Column(Float)
    employment_years = Column(Float)

    ext1 = Column(Float)  # External credit source 1
    ext2 = Column(Float)  # External credit source 2
    ext3 = Column(Float)  # External credit source 3

    ext_mean = Column(Float)  # Mean of ext1-ext3
    ext_std = Column(Float)  # Standard deviation
    ext_min = Column(Float)
    ext_max = Column(Float)

    credit_income_ratio = Column(Float)  # Loan amount / income
    annuity_income_ratio = Column(Float)  # Payment / income
    credit_term = Column(Float)  # Annuity / credit (implied term)

    income_per_child = Column(Float)
    credit_goods_ratio = Column(Float)

    bureau_year = Column(Float)  # Credit bureau inquiries in past year
    bureau_week = Column(Float)  # Inquiries in past week
    bureau_month = Column(Float)  # Inquiries in past month

    def30 = Column(Float)  # Social circle defaults at 30 days
    def60 = Column(Float)  # Social circle defaults at 60 days

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CreditPrediction(Base):
    """Result of a credit risk prediction"""
    __tablename__ = "credit_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    application_id = Column(Integer, ForeignKey("credit_applications.id"), nullable=True)
    risk_score = Column(Float)  # 0.0 to 1.0 (higher = riskier)
    risk_label = Column(String(20))  # "Low Risk", "Medium Risk", "High Risk"
    confidence = Column(Float)  # Model confidence (0-1)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= MARKET =================
class MarketRiskData(Base):
    """Market risk (VaR) prediction results"""
    __tablename__ = "market_risk_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    symbol = Column(String(20))  # Ticker symbol analyzed
    open_price = Column(Float)
    close_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    volume = Column(BigInteger)  # Trading volume
    risk_score = Column(Float)  # VaR value
    risk_level = Column(String(50))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= LIQUIDITY =================
class LiquidityRisk(Base):
    """Liquidity risk — ability to meet short-term obligations"""
    __tablename__ = "liquidity_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assets = Column(Float)
    liabilities = Column(Float)
    cash_flow = Column(Float)
    liquidity_ratio = Column(Float)  # Current ratio = current assets / current liabilities
    risk_score = Column(Float)
    risk_label = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= OPERATIONAL =================
class OperationalRisk(Base):
    """Operational risk — process failures, system errors, human errors"""
    __tablename__ = "operational_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    process_failures = Column(Integer, default=0)
    system_errors = Column(Integer, default=0)
    human_errors = Column(Integer, default=0)
    risk_score = Column(Float)
    risk_level = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= BUSINESS =================
class BusinessRisk(Base):
    """Business risk — revenue concentration, competition, growth"""
    __tablename__ = "business_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    revenue = Column(Float)
    expenses = Column(Float)
    competition_level = Column(String(50))
    growth_rate = Column(Float)
    risk_score = Column(Float)
    risk_level = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= FINANCIAL =================
class FinancialRisk(Base):
    """Financial health — leverage, ROA, debt structure"""
    __tablename__ = "financial_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    income = Column(Float)
    debt = Column(Float)
    assets = Column(Float)
    financial_ratio = Column(Float)  # e.g., Debt-to-Asset ratio
    risk_score = Column(Float)
    risk_label = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= ANALYSIS =================
class RiskAnalysis(Base):
    """General risk analysis results (VaR, Sharpe, Beta)"""
    __tablename__ = "risk_analysis"

    id = Column(Integer, primary_key=True, index=True)
    risk_type = Column(String(50))  # e.g., "market", "credit"
    entity_id = Column(Integer, index=True)
    var_value = Column(Float)  # Value at Risk
    sharpe_ratio = Column(Float)  # Risk-adjusted return (higher = better)
    beta = Column(Float)  # Volatility vs market (1 = tracks market)
    volatility = Column(Float)  # Standard deviation of returns
    max_drawdown = Column(Float)  # Largest peak-to-trough decline
    confidence = Column(Float)  # Confidence level
    analysed_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= FRAUD =================
class FraudPrediction(Base):
    """E-commerce fraud detection results"""
    __tablename__ = "fraud_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount = Column(Float)  # Transaction amount
    payment_method = Column(String(50))  # e.g., "Credit Card", "PayPal"
    product_category = Column(String(50))  # e.g., "Electronics"
    fraud_probability = Column(Float)  # 0.0 to 1.0
    label = Column(String(20))  # "Fraud" or "Legitimate"
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= ML =================
class MLPrediction(Base):
    """Generic ML prediction log (stores any model's output)"""
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(50))  # e.g., "xgboost", "catboost"
    risk_type = Column(String(50))  # e.g., "credit", "market"
    entity_id = Column(Integer, index=True)
    risk_score = Column(Float)
    risk_label = Column(String(20))
    confidence = Column(Float)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())


class MLPredictionFeature(Base):
    """Stores individual feature values for a given ML prediction (for debugging/explainability)"""
    __tablename__ = "ml_prediction_features"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("ml_predictions.id"), nullable=False, index=True)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Float, nullable=False)