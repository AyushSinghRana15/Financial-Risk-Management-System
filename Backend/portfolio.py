from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Portfolio, User

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


# 📥 Request Schema
class PortfolioCreate(BaseModel):
    email: str
    asset_name: str
    asset_type: str
    quantity: float
    buy_price: float
    current_price: float


# ➕ ADD ASSET
@router.post("/add")
def add_portfolio(data: PortfolioCreate, db: Session = Depends(get_db)):

    # 🔍 Find user
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
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

    total_value = data.quantity * data.current_price

    new_asset = Portfolio(
        user_id=user.id,
        asset_name=data.asset_name,
        asset_type=data.asset_type,
        quantity=data.quantity,
        buy_price=data.buy_price,
        current_price=data.current_price,
        total_value=total_value
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
            "total_value": new_asset.total_value
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
            "total_value": a.total_value
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