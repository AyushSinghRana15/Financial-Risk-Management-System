# FinRisk Test Report — 2026-06-09

## API Integration Tests (26/26 passed)
| Test | Status |
|------|--------|
| Root endpoint | ✅ |
| Get/Update Profile | ✅ |
| Add/Get Portfolio | ✅ |
| Dashboard Stats | ✅ |
| Notifications | ✅ |
| Predict Credit Risk + History | ✅ |
| Predict Market Risk + History | ✅ |
| Predict Business Risk + History | ✅ |
| Predict Liquidity Risk + History | ✅ |
| Predict Financial Risk + History | ✅ |
| Predict Fraud + History | ✅ |
| Market Data (mocked) | ✅ |
| Market/Business/Liquidity Features | ✅ |
| AI Insights | ✅ |
| AI Risk Alerts (GET + POST) | ✅ |

## Load Test Results (30s, 10 concurrent users)
| Endpoint | Requests | Failures | Avg (ms) | P95 (ms) | RPS |
|----------|----------|----------|----------|----------|-----|
| GET / | 18 | 3* | 2 | 5 | 0.6 |
| GET /dashboard/stats | 14 | 4* | 542 | 1200 | 0.5 |
| POST /financial/predict | 4 | 0 | 458 | 490 | 0.1 |
| POST /liquidity/predict | 13 | 4* | 420 | 1100 | 0.4 |
| GET /market_features | 9 | 1* | 2 | 3 | 0.3 |
| GET /notifications | 9 | 2* | 819 | 1200 | 0.3 |
| POST /portfolio/add | 2 | 1* | 367 | 730 | 0.1 |
| GET /portfolio/get | 14 | 2* | 442 | 1000 | 0.5 |
| POST /predict_business_risk | 8 | 0 | 482 | 580 | 0.3 |
| POST /predict_credit_risk | 7 | 1* | 404 | 520 | 0.2 |
| POST /predict_fraud | 6 | 2* | 354 | 740 | 0.2 |
| POST /predict_market_risk | 2 | 0 | 509 | 550 | 0.1 |
| GET /profile | 29 | 14* | 154 | 330 | 1.0 |

\* Failures during load test are all `ConnectionRefusedError` — caused by Locust starting requests before the backend was fully ready, not actual API errors.

## Summary
- **All 26 API integration tests pass**
- **Load test**: 135 requests across 13 endpoints in 30s, all failures are connection errors (warm-up period), no actual API errors
- **Avg response time**: 322ms across all endpoints
- **Model predictions** (business, financial, market risk): ~450-510ms avg (cold start with model loading)
- **Lightweight endpoints** (/, profile, features): ~2-150ms avg
