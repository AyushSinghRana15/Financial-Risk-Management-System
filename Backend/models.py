from sqlalchemy import Column, Integer, String, Float, DateTime, Text, BigInteger
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(50), unique=True, nullable=False)
    email      = Column(String(100), unique=True, nullable=False)
    password   = Column(String(200), nullable=False)
    role       = Column(String(20), default="analyst")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Portfolio(Base):
    __tablename__ = "portfolios"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, nullable=True)
    name        = Column(String(100), nullable=False)
    total_value = Column(Float, default=0.0)
    currency    = Column(String(10), default="INR")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class CreditApplication(Base):
    __tablename__ = "credit_applications"
    id                   = Column(Integer, primary_key=True, index=True)
    income               = Column(Float)
    credit               = Column(Float)
    annuity              = Column(Float)
    goods_price          = Column(Float)
    children             = Column(Integer)
    family_members       = Column(Integer)
    age                  = Column(Float)
    employment_years     = Column(Float)
    ext1                 = Column(Float)
    ext2                 = Column(Float)
    ext3                 = Column(Float)
    ext_mean             = Column(Float)
    ext_std              = Column(Float)
    ext_min              = Column(Float)
    ext_max              = Column(Float)
    credit_income_ratio  = Column(Float)
    annuity_income_ratio = Column(Float)
    credit_term          = Column(Float)
    income_per_child     = Column(Float)
    credit_goods_ratio   = Column(Float)
    bureau_year          = Column(Float)
    bureau_week          = Column(Float)
    bureau_month         = Column(Float)
    def30                = Column(Float)
    def60                = Column(Float)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())

class CreditPrediction(Base):
    __tablename__ = "credit_predictions"
    id             = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, nullable=True)
    risk_score     = Column(Float)
    risk_label     = Column(String(20))
    confidence     = Column(Float)
    predicted_at   = Column(DateTime(timezone=True), server_default=func.now())

class MarketRiskData(Base):
    __tablename__ = "market_risk_data"
    id          = Column(Integer, primary_key=True, index=True)
    symbol      = Column(String(20), nullable=False)
    open_price  = Column(Float)
    close_price = Column(Float)
    high_price  = Column(Float)
    low_price   = Column(Float)
    volume      = Column(BigInteger)
    risk_score  = Column(Float)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

class LiquidityRisk(Base):
    __tablename__ = "liquidity_risk"
    id              = Column(Integer, primary_key=True, index=True)
    asset_symbol    = Column(String(20))
    bid_price       = Column(Float)
    ask_price       = Column(Float)
    bid_ask_spread  = Column(Float)
    trading_volume  = Column(BigInteger)
    market_depth    = Column(Float)
    liquidity_score = Column(Float)
    risk_label      = Column(String(20))
    recorded_at     = Column(DateTime(timezone=True), server_default=func.now())

class OperationalRisk(Base):
    __tablename__ = "operational_risk"
    id             = Column(Integer, primary_key=True, index=True)
    event_type     = Column(String(50))
    description    = Column(Text)
    severity       = Column(String(20))
    financial_loss = Column(Float)
    department     = Column(String(50))
    risk_score     = Column(Float)
    occurred_at    = Column(DateTime(timezone=True), server_default=func.now())

class BusinessRisk(Base):
    __tablename__ = "business_risk"
    id             = Column(Integer, primary_key=True, index=True)
    company_name   = Column(String(100))
    revenue        = Column(Float)
    operating_cost = Column(Float)
    profit_margin  = Column(Float)
    debt_to_equity = Column(Float)
    market_share   = Column(Float)
    risk_score     = Column(Float)
    risk_label     = Column(String(20))
    recorded_at    = Column(DateTime(timezone=True), server_default=func.now())

class FinancialRisk(Base):
    __tablename__ = "financial_risk"
    id                 = Column(Integer, primary_key=True, index=True)
    entity_name        = Column(String(100))
    total_assets       = Column(Float)
    total_liabilities  = Column(Float)
    equity             = Column(Float)
    current_ratio      = Column(Float)
    debt_ratio         = Column(Float)
    interest_coverage  = Column(Float)
    risk_score         = Column(Float)
    risk_label         = Column(String(20))
    recorded_at        = Column(DateTime(timezone=True), server_default=func.now())

class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"
    id           = Column(Integer, primary_key=True, index=True)
    risk_type    = Column(String(50))
    entity_id    = Column(Integer)
    var_value    = Column(Float)
    sharpe_ratio = Column(Float)
    beta         = Column(Float)
    volatility   = Column(Float)
    max_drawdown = Column(Float)
    confidence   = Column(Float)
    analysed_at  = Column(DateTime(timezone=True), server_default=func.now())

class MLPrediction(Base):
    __tablename__ = "ml_predictions"
    id             = Column(Integer, primary_key=True, index=True)
    model_name     = Column(String(50))
    risk_type      = Column(String(50))
    entity_id      = Column(Integer)
    input_features = Column(Text)
    risk_score     = Column(Float)
    risk_label     = Column(String(20))
    confidence     = Column(Float)
    predicted_at   = Column(DateTime(timezone=True), server_default=func.now())
