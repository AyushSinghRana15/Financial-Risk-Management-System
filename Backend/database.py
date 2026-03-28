from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load env
load_dotenv()

# Get DB URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback (only for local dev)
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

print("DB Connected:", "SQLite" if "sqlite" in DATABASE_URL else "PostgreSQL")

# SQLite config
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

# PostgreSQL (Neon) config
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"sslmode": "require", "channel_binding": "require"}
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()