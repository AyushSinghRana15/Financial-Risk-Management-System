#!/bin/bash
set -e

MODEL_BUCKET="${MODEL_BUCKET:-finrisk-models}"

echo "Downloading ML models from S3 (bucket: $MODEL_BUCKET)..."
aws s3 cp "s3://$MODEL_BUCKET/models/" /app/Models/ --recursive --no-progress
echo "Models downloaded successfully."
ls -la /app/Models/

echo "Starting FinRisk API..."
cd /app/Backend
exec uvicorn main:app --host 0.0.0.0 --port 8000
