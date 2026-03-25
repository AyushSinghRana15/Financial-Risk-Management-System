from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

from database import get_db
from models import User

router = APIRouter()

# 🔹 Signup
@router.post("/signup")
def signup(user: dict, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == user["email"]).first()
    if existing:
        return {"error": "Email already registered"}

    token = str(uuid.uuid4())

    new_user = User(
        username=user["name"],
        email=user["email"],
        password=user["password"],  # hash later
        verification_token=token,
        is_verified=0
    )

    db.add(new_user)
    db.commit()

    print(f"Verify link: http://localhost:5173/verify/{token}")

    return {"message": "Verification email sent"}


# 🔹 Verify Email
@router.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        return {"error": "Invalid token"}

    user.is_verified = 1
    user.verification_token = None
    db.commit()

    return {"message": "Email verified"}


# 🔹 Login
@router.post("/login")
def login(user: dict, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user["email"]).first()

    if not db_user:
        return {"error": "User not found"}

    if db_user.is_verified == 0:
        return {"error": "Please verify your email first"}

    if db_user.password != user["password"]:
        return {"error": "Invalid credentials"}

    return {
        "name": db_user.username,
        "email": db_user.email,
        "role": db_user.role
    }