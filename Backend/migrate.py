from sqlalchemy import text
from database import engine

def migrate():
    with engine.connect() as conn:
        print("Running migrations...")
        
        migrations = [
            ("ALTER TABLE credit_predictions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);", "credit_predictions user_id"),
            ("ALTER TABLE market_risk_data ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);", "market_risk_data user_id"),
            ("ALTER TABLE market_risk_data ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50);", "market_risk_data risk_level"),
            ("ALTER TABLE liquidity_risk ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);", "liquidity_risk user_id"),
            ("ALTER TABLE business_risk ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);", "business_risk user_id"),
            ("ALTER TABLE financial_risk ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);", "financial_risk user_id"),
        ]
        
        for sql, desc in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"  ✓ {desc}")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print(f"  ✓ {desc} (already exists)")
                else:
                    print(f"  ✗ {desc}: {e}")
        
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS fraud_predictions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                amount FLOAT,
                payment_method VARCHAR(50),
                product_category VARCHAR(50),
                fraud_probability FLOAT,
                label VARCHAR(20),
                predicted_at TIMESTAMP DEFAULT NOW()
            );
        """))
        conn.commit()
        print("  ✓ fraud_predictions table")
        
        print("\nMigrations complete!")

if __name__ == "__main__":
    migrate()
