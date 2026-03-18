from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
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
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name        = Column(String(100), nullable=False)
    total_value = Column(Float, default=0.0)
    currency    = Column(String(10), default="INR")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class Asset(Base):
    __tablename__ = "assets"
    id           = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"))
    symbol       = Column(String(20), nullable=False)
    asset_type   = Column(String(30), nullable=False)
    quantity     = Column(Float, nullable=False)
    buy_price    = Column(Float, nullable=False)
    buy_date     = Column(String(20))

class Transaction(Base):
    __tablename__ = "transactions"
    id        = Column(Integer, primary_key=True, index=True)
    asset_id  = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"))
    txn_type  = Column(String(10), nullable=False)
    quantity  = Column(Float, nullable=False)
    price     = Column(Float, nullable=False)
    txn_date  = Column(DateTime(timezone=True), server_default=func.now())

class RiskMetric(Base):
    __tablename__ = "risk_metrics"
    id            = Column(Integer, primary_key=True, index=True)
    portfolio_id  = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"))
    var_value     = Column(Float)
    sharpe_ratio  = Column(Float)
    beta          = Column(Float)
    volatility    = Column(Float)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"
    id           = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"))
    alert_type   = Column(String(50))
    threshold    = Column(Float)
    current_val  = Column(Float)
    status       = Column(String(20), default="active")
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())

class MarketData(Base):
    __tablename__ = "market_data"
    id          = Column(Integer, primary_key=True, index=True)
    symbol      = Column(String(20), nullable=False)
    open_price  = Column(Float)
    close_price = Column(Float)
    high_price  = Column(Float)
    low_price   = Column(Float)
    volume      = Column(Integer)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
