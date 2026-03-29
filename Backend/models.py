from sqlalchemy import Column, Integer, String, Float, DateTime, Text, BigInteger, Boolean,ForeignKey
from sqlalchemy.sql import func
from database import Base

# ================= USER =================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    age = Column(Integer, nullable=True)
    risk_profile = Column(String(20), nullable=True)

    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= PORTFOLIO =================
class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    asset_name = Column(String)
    asset_type = Column(String)

    quantity = Column(Float)
    buy_price = Column(Float)
    current_price = Column(Float)
    total_value = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= CREDIT =================
class CreditApplication(Base):
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

    ext1 = Column(Float)
    ext2 = Column(Float)
    ext3 = Column(Float)

    ext_mean = Column(Float)
    ext_std = Column(Float)
    ext_min = Column(Float)
    ext_max = Column(Float)

    credit_income_ratio = Column(Float)
    annuity_income_ratio = Column(Float)
    credit_term = Column(Float)

    income_per_child = Column(Float)
    credit_goods_ratio = Column(Float)

    bureau_year = Column(Float)
    bureau_week = Column(Float)
    bureau_month = Column(Float)

    def30 = Column(Float)
    def60 = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CreditPrediction(Base):
    __tablename__ = "credit_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    application_id = Column(Integer)
    risk_score = Column(Float)
    risk_label = Column(String(20))
    confidence = Column(Float)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= MARKET =================
class MarketRiskData(Base):
    __tablename__ = "market_risk_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    symbol = Column(String(20))
    open_price = Column(Float)
    close_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    volume = Column(BigInteger)
    risk_score = Column(Float)
    risk_level = Column(String(50))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= LIQUIDITY =================
class LiquidityRisk(Base):
    __tablename__ = "liquidity_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assets = Column(Float)
    liabilities = Column(Float)
    cash_flow = Column(Float)
    liquidity_ratio = Column(Float)
    risk_score = Column(Float)
    risk_label = Column(String(20))
    recorded_at = Column("created_at", DateTime(timezone=True), server_default=func.now())


# ================= OPERATIONAL =================
class OperationalRisk(Base):
    __tablename__ = "operational_risk"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50))
    description = Column(Text)
    severity = Column(String(20))
    financial_loss = Column(Float)
    department = Column(String(50))
    risk_score = Column(Float)
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= BUSINESS =================
class BusinessRisk(Base):
    __tablename__ = "business_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    revenue = Column(Float)
    expenses = Column(Float)
    competition_level = Column(String(50))
    growth_rate = Column(Float)
    risk_score = Column(Float)
    risk_level = Column(String(20))
    recorded_at = Column("created_at", DateTime(timezone=True), server_default=func.now())


# ================= FINANCIAL =================
class FinancialRisk(Base):
    __tablename__ = "financial_risk"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    income = Column(Float)
    debt = Column(Float)
    assets = Column(Float)
    financial_ratio = Column(Float)
    risk_score = Column(Float)
    risk_label = Column(String(20))
    recorded_at = Column("created_at", DateTime(timezone=True), server_default=func.now())


# ================= ANALYSIS =================
class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"

    id = Column(Integer, primary_key=True, index=True)
    risk_type = Column(String(50))
    entity_id = Column(Integer)
    var_value = Column(Float)
    sharpe_ratio = Column(Float)
    beta = Column(Float)
    volatility = Column(Float)
    max_drawdown = Column(Float)
    confidence = Column(Float)
    analysed_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= FRAUD =================
class FraudPrediction(Base):
    __tablename__ = "fraud_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount = Column(Float)
    payment_method = Column(String(50))
    product_category = Column(String(50))
    fraud_probability = Column(Float)
    label = Column(String(20))
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= ML =================
class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(50))
    risk_type = Column(String(50))
    entity_id = Column(Integer)
    input_features = Column(Text)
    risk_score = Column(Float)
    risk_label = Column(String(20))
    confidence = Column(Float)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())