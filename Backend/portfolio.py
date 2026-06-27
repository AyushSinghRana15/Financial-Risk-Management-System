from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel  # For request validation
from database import get_db
from models import Portfolio, User

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


# 📥 Request Schema — Pydantic validates types and required fields automatically
class PortfolioCreate(BaseModel):
    email: str
    asset_name: str  # e.g., "AAPL", "BTC", "Reliance Industries"
    asset_type: str  # e.g., "stock", "crypto", "mutual_fund", "etf"
    quantity: float  # Number of shares/units owned
    buy_price: float  # Price per unit when purchased
    current_price: float  # Current market price per unit


# ➕ ADD ASSET
@router.post("/add")
def add_portfolio(data: PortfolioCreate, db: Session = Depends(get_db)):

    # 🔍 Find user
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        # Auto-create user if they don't exist (for new Google OAuth users)
        user = User(
            name=data.email.split("@")[0],
            email=data.email,
            password_hash="google_oauth",
            age=22,
            risk_profile="Medium"
            )   
        db.add(user)
        db.commit()
        db.refresh(user)

    new_asset = Portfolio(
        user_id=user.id,
        asset_name=data.asset_name,
        asset_type=data.asset_type,
        quantity=data.quantity,
        buy_price=data.buy_price,
        current_price=data.current_price,
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    return {
        "message": "Asset added successfully",
        "data": {
            "id": new_asset.id,
            "asset_name": new_asset.asset_name,
            "asset_type": new_asset.asset_type,
            "quantity": new_asset.quantity,
            "buy_price": new_asset.buy_price,
            "current_price": new_asset.current_price,
            "total_value": new_asset.quantity * new_asset.current_price,
        }
    }


# 📤 GET USER PORTFOLIO
@router.get("/get/{email}")
def get_portfolio(email: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    assets = db.query(Portfolio).filter(
        Portfolio.user_id == user.id
    ).all()

    # 🔥 Convert to JSON-safe format
    portfolio_data = [
        {
            "id": a.id,
            "asset_name": a.asset_name,
            "asset_type": a.asset_type,
            "quantity": a.quantity,
            "buy_price": a.buy_price,
            "current_price": a.current_price,
            "total_value": a.quantity * a.current_price,
        }
        for a in assets
    ]

    return {
        "portfolio": portfolio_data
    }
# DELETE ASSET
@router.delete("/{portfolio_id}/{email}")
def delete_portfolio(portfolio_id: int, email: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == email).first()

    asset = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == user.id
    ).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Not allowed")

    db.delete(asset)
    db.commit()

    return {"message": "Deleted"}