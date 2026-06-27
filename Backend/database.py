from sqlalchemy import create_engine  # Database engine factory
from sqlalchemy.orm import sessionmaker, declarative_base  # ORM: maps Python classes to DB tables
import os
from dotenv import load_dotenv

# Load env
load_dotenv()

# Get DB URL from environment variable (set in .env or Render dashboard)
DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback (only for local dev) — SQLite file stored locally
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

print("DB Connected:", "SQLite" if "sqlite" in DATABASE_URL else "PostgreSQL")

# SQLite config — check_same_thread=False allows FastAPI's async/multi-thread access
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

# PostgreSQL (Neon serverless) config
# Neon uses pooling and requires SSL for security
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,  # Max 5 persistent connections in the pool
        max_overflow=10,  # Up to 10 additional connections if pool is exhausted
        pool_pre_ping=True,  # Test connections before using them (avoids stale connections)
        pool_recycle=300,  # Recycle connections after 300 seconds to prevent timeouts
        connect_args={"sslmode": "require", "channel_binding": "require"}  # Force SSL encryption
    )

# SessionLocal: a factory that creates new database sessions
# Each session = a single database transaction/connection
SessionLocal = sessionmaker(
    autocommit=False,  # We manually commit/rollback
    autoflush=False,  # Don't auto-flush changes before queries
    bind=engine
)

# Base: base class for all SQLAlchemy ORM models
# Models inherit from Base to get mapped to database tables
Base = declarative_base()

# Dependency — yields a session per request, closes it when done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()