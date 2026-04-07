from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["Auth"])


class GoogleUser(BaseModel):
    name: str
    email: str
    picture: str = None


@router.post("/google")
def google_login(data: GoogleUser, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        user = User(
            name=data.name,
            email=data.email,
            password_hash="google_oauth",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }
