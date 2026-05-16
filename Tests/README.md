# FinRisk Tests

## Prerequisites

```bash
pip install pytest httpx locust
```

## Test Files

| File | Type | Description |
|---|---|---|
| `test_api.py` | Integration | Tests all API endpoints with SQLite test DB |
| `locustfile.py` | Load | Locust-based load/performance testing |
| `run_tests.sh` | Script | Runs all tests and generates a report |

## Running Tests

### API Integration Tests

```bash
cd Backend
python -m pytest ../Tests/test_api.py -v --tb=short
```

### Load Test (requires backend running)

```bash
# Terminal 1: Start backend
cd Backend && uvicorn main:app --reload --port 8000

# Terminal 2: Run load test
locust -f Tests/locustfile.py --host=http://localhost:8000 --headless -u 50 -r 10 --run-time 60s
```

Or run with web UI:
```bash
locust -f Tests/locustfile.py --host=http://localhost:8000
```

### All Tests (automated)

```bash
bash Tests/run_tests.sh
```

Results are stored in `Tests/results/`.
