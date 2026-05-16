"""
API Integration Tests for FinRisk Backend
Tests all major endpoints with mocked DB.
Run: pytest Tests/test_api.py -v --tb=short
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "Backend"))

os.environ["DATABASE_URL"] = "sqlite:///./test_finrisk.db"
os.environ["OPENROUTER_API_KEY"] = "test-key"
os.environ["GOOGLE_CLIENT_ID"] = "test-client-id"

from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from database import engine, Base, SessionLocal
from main import app, get_db

client = TestClient(app)
TEST_EMAIL = "test@example.com"

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_get_profile():
    resp = client.get(f"/profile?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert resp.json()["email"] == TEST_EMAIL


def test_update_profile():
    resp = client.put("/profile", json={
        "email": TEST_EMAIL, "name": "Test User", "age": 30, "risk_profile": "High"
    })
    assert resp.status_code == 200
    assert resp.json()["message"] == "Profile updated"


def test_add_portfolio_asset():
    resp = client.post("/portfolio/add", json={
        "email": TEST_EMAIL, "asset_name": "AAPL", "asset_type": "stock",
        "quantity": 10, "buy_price": 150.0, "current_price": 175.0
    })
    assert resp.status_code == 200
    assert resp.json()["message"] == "Asset added successfully"


def test_get_portfolio():
    resp = client.get(f"/portfolio/get/{TEST_EMAIL}")
    assert resp.status_code == 200
    assert len(resp.json()["portfolio"]) >= 1


def test_dashboard_stats():
    resp = client.get(f"/dashboard/stats?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "portfolio_value" in resp.json()


def test_notifications():
    resp = client.get(f"/notifications?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_predict_credit_risk():
    resp = client.post("/predict_credit_risk", json={
        "email": TEST_EMAIL, "income": 50000, "credit": 20000, "annuity": 5000,
        "goods_price": 25000, "age": 35, "employment_years": 5, "children": 1,
        "family_members": 3, "ext1": 0.5, "ext2": 0.3, "ext3": 0.2,
        "gender": "Male", "owns_car": "Yes", "owns_house": "Yes"
    })
    assert resp.status_code == 200
    assert "default_probability" in resp.json()


def test_credit_predictions_history():
    resp = client.get(f"/credit_predictions?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "predictions" in resp.json()


def test_predict_market_risk():
    resp = client.post("/predict_market_risk", json={
        "email": TEST_EMAIL, "confidence": "95%"
    })
    assert resp.status_code == 200
    assert "predicted_var" in resp.json() or "risk_level" in resp.json()


def test_market_risk_history():
    resp = client.get(f"/market_risk_history?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "history" in resp.json()


def test_predict_business_risk():
    resp = client.post("/predict_business_risk", json={
        "email": TEST_EMAIL, "feature_0": 0.5
    })
    assert resp.status_code == 200
    assert "risk_probability" in resp.json() or "risk_level" in resp.json()


def test_business_risk_history():
    resp = client.get(f"/business_risk_history?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "history" in resp.json()


def test_predict_liquidity_risk():
    resp = client.post("/liquidity/predict", json={
        "email": TEST_EMAIL, "assets": 500000, "liabilities": 200000, "cash_flow": 50000
    })
    assert resp.status_code == 200


def test_liquidity_risk_history():
    resp = client.get(f"/liquidity/history?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "history" in resp.json()


def test_predict_financial_risk():
    resp = client.post("/financial/predict", json={
        "email": TEST_EMAIL, "ROA": 0.15, "Leverage": 0.5,
        "Asset_Turnover": 1.2, "Gross_Profit_Liabilities": 0.8, "Operating_Profit": 0.3
    })
    assert resp.status_code == 200


def test_financial_risk_history():
    resp = client.get(f"/financial/history?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "history" in resp.json()


def test_predict_fraud():
    resp = client.post("/predict_fraud", json={
        "email": TEST_EMAIL, "amount": 500, "quantity": 2,
        "payment_method": "Credit Card", "product_category": "Electronics",
        "customer_location": "USA", "device_used": "Mobile",
        "customer_age": 30, "account_age_days": 365, "transaction_hour": 14,
        "transaction_day": 15, "transaction_month": 6
    })
    assert resp.status_code == 200
    assert "prediction" in resp.json() or "fraud_probability" in resp.json()


def test_fraud_history():
    resp = client.get(f"/fraud_history?email={TEST_EMAIL}")
    assert resp.status_code == 200
    assert "history" in resp.json()


@patch("routes.market.yf.Ticker")
def test_market_data(mock_ticker):
    import pandas as pd
    mock_instance = MagicMock()
    mock_instance.history.return_value = pd.DataFrame({
        "Close": [150.0, 152.0]
    }, index=pd.date_range("2024-01-01", periods=2))
    mock_ticker.return_value = mock_instance

    resp = client.get("/market-data")
    assert resp.status_code == 200


def test_market_features():
    resp = client.get("/market_features")
    assert resp.status_code == 200
    assert "features" in resp.json()


def test_business_features():
    resp = client.get("/business_features")
    assert resp.status_code == 200
    assert "features" in resp.json()


def test_liquidity_features():
    resp = client.get("/liquidity/features")
    assert resp.status_code == 200
    assert "features" in resp.json()


def test_ai_insights():
    resp = client.get("/ai-insights")
    assert resp.status_code == 200


def test_ai_risk_alerts_get():
    resp = client.get("/ai-risk-alerts")
    assert resp.status_code == 200


def test_ai_risk_alerts_post():
    resp = client.post("/ai-risk-alerts", json={"prompt": "Analyze my portfolio"})
    assert resp.status_code == 200
