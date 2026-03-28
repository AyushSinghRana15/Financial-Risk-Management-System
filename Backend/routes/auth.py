from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from pydantic import BaseModel

from database import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# 📥 SCHEMAS
# =========================
class GoogleUser(BaseModel):
    name: str
    email: str
    picture: str = None


# =========================
# 🔹 GOOGLE LOGIN (🔥 NEW)
# =========================
@router.post("/google")
def google_login(data: GoogleUser, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    # 🆕 Create user if not exists
    if not user:
        user = User(
            username=data.name,     # ⚠️ matches your DB
            email=data.email,
            is_verified=1           # Google users are verified
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "id": user.id,
        "name": user.username,
        "email": user.email
    }


# =========================
# 🔹 SIGNUP
# =========================
@router.post("/signup")
def signup(user: dict, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == user["email"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    token = str(uuid.uuid4())

    new_user = User(
        username=user["name"],
        email=user["email"],
        password=user["password"],  # ⚠️ hash later
        verification_token=token,
        is_verified=0
    )

    db.add(new_user)
    db.commit()

    print(f"Verify link: http://localhost:5173/verify/{token}")

    return {"message": "Verification email sent"}


# =========================
# 🔹 VERIFY EMAIL
# =========================
@router.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    user.is_verified = 1
    user.verification_token = None
    db.commit()

    return {"message": "Email verified"}


# =========================
# 🔹 LOGIN
# =========================
@router.post("/login")
def login(user: dict, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user["email"]).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.is_verified == 0:
        raise HTTPException(status_code=403, detail="Please verify your email first")

    if db_user.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "name": db_user.username,
        "email": db_user.email,
        "role": db_user.role
    }