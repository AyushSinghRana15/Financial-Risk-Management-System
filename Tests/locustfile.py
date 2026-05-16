"""
Locust Load Test for FinRisk Backend
======================================
Measures throughput, response times, and error rates.
Run: locust -f Tests/locustfile.py --host=https://finrisk.online --headless -u 50 -r 10 --run-time 60s
     OR for local: locust -f Tests/locustfile.py --host=http://localhost:8000 --headless -u 20 -r 5 --run-time 30s
"""

from locust import HttpUser, task, between
import random

TEST_EMAIL = "loadtest@example.com"


class FinRiskUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.ensure_profile()

    def ensure_profile(self):
        self.client.get(f"/profile?email={TEST_EMAIL}")

    @task(3)
    def health_check(self):
        self.client.get("/")

    @task(3)
    def get_profile(self):
        self.client.get(f"/profile?email={TEST_EMAIL}")

    @task(3)
    def get_dashboard(self):
        self.client.get(f"/dashboard/stats?email={TEST_EMAIL}")

    @task(2)
    def get_notifications(self):
        self.client.get(f"/notifications?email={TEST_EMAIL}")

    @task(2)
    def get_portfolio(self):
        self.client.get(f"/portfolio/get/{TEST_EMAIL}")

    @task(2)
    def predict_credit_risk(self):
        self.client.post("/predict_credit_risk", json={
            "email": TEST_EMAIL,
            "income": random.randint(30000, 150000),
            "credit": random.randint(5000, 50000),
            "annuity": random.randint(1000, 10000),
            "goods_price": random.randint(10000, 50000),
            "age": random.randint(22, 65),
            "employment_years": random.randint(0, 30),
            "children": random.randint(0, 4),
            "family_members": random.randint(1, 6),
            "ext1": round(random.uniform(0, 1), 2),
            "ext2": round(random.uniform(0, 1), 2),
            "ext3": round(random.uniform(0, 1), 2),
            "gender": random.choice(["Male", "Female"]),
            "owns_car": random.choice(["Yes", "No"]),
            "owns_house": random.choice(["Yes", "No"]),
        })

    @task(1)
    def predict_market_risk(self):
        self.client.post("/predict_market_risk", json={
            "email": TEST_EMAIL,
            "confidence": "95%"
        })

    @task(1)
    def predict_business_risk(self):
        features = {f"feature_{i}": round(random.uniform(0, 1), 4) for i in range(10)}
        features["email"] = TEST_EMAIL
        self.client.post("/predict_business_risk", json=features)

    @task(1)
    def predict_liquidity_risk(self):
        self.client.post("/liquidity/predict", json={
            "email": TEST_EMAIL,
            "assets": round(random.uniform(100000, 1000000), 2),
            "liabilities": round(random.uniform(50000, 500000), 2),
            "cash_flow": round(random.uniform(10000, 200000), 2)
        })

    @task(1)
    def predict_financial_risk(self):
        self.client.post("/financial/predict", json={
            "email": TEST_EMAIL,
            "ROA": round(random.uniform(-0.2, 0.3), 4),
            "Leverage": round(random.uniform(0.1, 0.9), 4),
            "Asset_Turnover": round(random.uniform(0.5, 2.0), 4),
            "Gross_Profit_Liabilities": round(random.uniform(0.0, 1.0), 4),
            "Operating_Profit": round(random.uniform(-0.1, 0.5), 4)
        })

    @task(1)
    def predict_fraud(self):
        self.client.post("/predict_fraud", json={
            "email": TEST_EMAIL,
            "amount": round(random.uniform(10, 5000), 2),
            "quantity": random.randint(1, 10),
            "payment_method": random.choice(["Credit Card", "Debit Card", "PayPal", "Bank Transfer"]),
            "product_category": random.choice(["Electronics", "Clothing", "Home", "Beauty"]),
            "customer_location": random.choice(["USA", "UK", "India", "Germany"]),
            "device_used": random.choice(["Mobile", "Desktop", "Tablet"]),
            "customer_age": random.randint(18, 70),
            "account_age_days": random.randint(1, 1000),
            "transaction_hour": random.randint(0, 23),
            "transaction_day": random.randint(1, 28),
            "transaction_month": random.randint(1, 12)
        })

    @task(2)
    def get_market_features(self):
        self.client.get("/market_features")

    @task(1)
    def add_portfolio_asset(self):
        self.client.post("/portfolio/add", json={
            "email": TEST_EMAIL,
            "asset_name": random.choice(["AAPL", "GOOGL", "MSFT", "TSLA", "BTC", "ETH"]),
            "asset_type": random.choice(["stock", "crypto", "etf"]),
            "quantity": round(random.uniform(1, 100), 2),
            "buy_price": round(random.uniform(10, 500), 2),
            "current_price": round(random.uniform(10, 500), 2)
        })
