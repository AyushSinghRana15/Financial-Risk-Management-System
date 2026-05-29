#!/bin/bash
set -e

# ==============================================================
# FinRisk AWS Deployment Script (App Runner)
# Run this after pushing the deploy/aws branch.
# Prerequisites: AWS CLI configured, ECR repo created.
# ==============================================================

REGION="${AWS_REGION:-us-east-1}"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME="${ECR_REPO_NAME:-finrisk-backend}"
SERVICE_NAME="${APP_RUNNER_SERVICE:-finrisk-api}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
MODEL_BUCKET="${MODEL_BUCKET:-finrisk-models}"

echo "=== Step 1: Upload ML models to S3 ==="
aws s3 sync ../Models/ "s3://$MODEL_BUCKET/models/" --no-progress

echo "=== Step 2: Build Docker image ==="
docker build -t "$REPO_NAME:$IMAGE_TAG" ..

echo "=== Step 3: Tag & push to ECR ==="
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

ECR_URI="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG"
docker tag "$REPO_NAME:$IMAGE_TAG" "$ECR_URI"
docker push "$ECR_URI"

echo "=== Step 4: Deploy to App Runner ==="
# Check if service exists
SERVICE_ARN=$(aws apprunner list-services --region "$REGION" \
  --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" \
  --output text)

if [ -z "$SERVICE_ARN" ]; then
  echo "Creating new App Runner service..."
  aws apprunner create-service \
    --region "$REGION" \
    --service-name "$SERVICE_NAME" \
    --source-configuration '{
      "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam::'$ACCOUNT':role/AppRunnerECRAccessRole"
      },
      "ImageRepository": {
        "ImageIdentifier": "'$ECR_URI'",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
          "Port": "8000"
        }
      }
    }' \
    --instance-configuration '{"Cpu":"1 vCPU","Memory":"2 GB"}' \
    --health-check-configuration '{"Path":"/","Interval":30,"Timeout":5,"HealthyThreshold":2,"UnhealthyThreshold":5}'
else
  echo "Updating existing App Runner service..."
  aws apprunner update-service \
    --region "$REGION" \
    --service-arn "$SERVICE_ARN" \
    --source-configuration '{
      "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam://'$ACCOUNT':role/AppRunnerECRAccessRole"
      },
      "ImageRepository": {
        "ImageIdentifier": "'$ECR_URI'",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
          "Port": "8000"
        }
      }
    }'
fi

echo "=== Done! ==="
echo "Monitor deployment: aws apprunner describe-service --region $REGION --service-arn $SERVICE_ARN"
