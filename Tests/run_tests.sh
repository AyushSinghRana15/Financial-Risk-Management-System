#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKEND_DIR="$PROJECT_DIR/Backend"

mkdir -p "$RESULTS_DIR"

echo "============================================"
echo "  FinRisk Test Suite - $TIMESTAMP"
echo "============================================"

# 1. API Integration Tests
echo ""
echo "[1/3] Running API Integration Tests..."
echo "----------------------------------------"
cd "$BACKEND_DIR"
python -m pytest "$SCRIPT_DIR/test_api.py" -v --tb=short 2>&1 | tee "$RESULTS_DIR/api_tests_$TIMESTAMP.log"
API_EXIT=${PIPESTATUS[0]}

# 2. Locust Load Test (local, quick check)
echo ""
echo "[2/3] Running Quick Load Test..."
echo "----------------------------------------"
if lsof -i :8000 > /dev/null 2>&1; then
    HOST="http://localhost:8000"
    echo "Backend running at $HOST - running load test..."
    cd "$PROJECT_DIR"
    locust -f "$SCRIPT_DIR/locustfile.py" \
        --host="$HOST" \
        --headless \
        -u 10 -r 5 \
        --run-time 30s \
        --csv="$RESULTS_DIR/load_test_$TIMESTAMP" \
        2>&1 | tee "$RESULTS_DIR/load_test_$TIMESTAMP.log" || true
    
    # Parse stats from the CSV
    if [ -f "$RESULTS_DIR/load_test_${TIMESTAMP}_stats.csv" ]; then
        echo ""
        echo "=== Load Test Summary ==="
        python3 -c "
import csv
with open('$RESULTS_DIR/load_test_${TIMESTAMP}_stats.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    if rows:
        total_rps = sum(float(r['Request Count']) for r in rows if r['Type'] != '') / 30
        total_fails = sum(float(r['Failure Count']) for r in rows if r['Type'] != '')
        avg_response = sum(float(r['Average Response Time']) for r in rows if r['Type'] != '') / max(len([r for r in rows if r['Type'] != '']), 1)
        p95 = sum(float(r['95%']) for r in rows if r['Type'] != '') / max(len([r for r in rows if r['Type'] != '']), 1)
        print(f'  Avg RPS:           {total_rps:.1f}')
        print(f'  Requests/day (est): {total_rps * 86400:.0f}')
        print(f'  Avg Response Time:  {avg_response:.0f}ms')
        print(f'  P95 Response Time:  {p95:.0f}ms')
        print(f'  Total Failures:     {total_fails:.0f}')
    else:
        print('  No stats data available')
" 2>&1 | tee -a "$RESULTS_DIR/load_test_$TIMESTAMP.log"
    fi
else
    echo "Backend not running on port 8000 - starting it for load test..."
    cd "$BACKEND_DIR"
    uvicorn main:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    sleep 3
    cd "$PROJECT_DIR"
    locust -f "$SCRIPT_DIR/locustfile.py" \
        --host="http://localhost:8000" \
        --headless \
        -u 10 -r 5 \
        --run-time 30s \
        --csv="$RESULTS_DIR/load_test_$TIMESTAMP" \
        2>&1 | tee "$RESULTS_DIR/load_test_$TIMESTAMP.log" || true
    kill $BACKEND_PID 2>/dev/null || true
fi

# 3. Generate Summary Report
echo ""
echo "[3/3] Generating Summary Report..."
echo "----------------------------------------"
{
    echo "# FinRisk Test Report - $TIMESTAMP"
    echo ""
    
    echo "## 1. API Integration Tests"
    if [ -f "$RESULTS_DIR/api_tests_$TIMESTAMP.log" ]; then
        PASSED=$(grep -c "PASSED" "$RESULTS_DIR/api_tests_$TIMESTAMP.log" || true)
        FAILED=$(grep -c "FAILED" "$RESULTS_DIR/api_tests_$TIMESTAMP.log" || true)
        echo "- Passed: $PASSED"
        echo "- Failed: $FAILED"
    fi
    
    echo ""
    echo "## 2. Load Test Results"
    if [ -f "$RESULTS_DIR/load_test_${TIMESTAMP}_stats.csv" ]; then
        python3 -c "
import csv
with open('$RESULTS_DIR/load_test_${TIMESTAMP}_stats.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    endpoints = [r for r in rows if r['Type'] != '']
    print('| Endpoint | Type | Requests | Failures | Avg (ms) | Min (ms) | Max (ms) | P95 (ms) | RPS |')
    print('|---|---|---|---|---|---|---|---|---|')
    for r in endpoints:
        rps = float(r['Request Count']) / 30
        print(f'| {r[\"Name\"]} | {r[\"Type\"]} | {r[\"Request Count\"]} | {r[\"Failure Count\"]} | {r[\"Average Response Time\"]} | {r[\"Min Response Time\"]} | {r[\"Max Response Time\"]} | {r[\"95%\"]} | {rps:.1f} |')
" 2>/dev/null
    fi
} > "$RESULTS_DIR/report_$TIMESTAMP.md"

echo ""
echo "============================================"
echo "  Test suite complete!"
echo "  Results: $RESULTS_DIR"
echo "  Report:  $RESULTS_DIR/report_$TIMESTAMP.md"
echo "============================================"
