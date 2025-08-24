#!/bin/bash
set -e

ENVIRONMENT=$1
IMAGE_TAG=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$IMAGE_TAG" ]; then
    echo "Usage: $0 <environment> <image_tag>"
    exit 1
fi

echo "🚀 Deploying Garment Platform to $ENVIRONMENT..."

# Export environment variables for envsubst
export ENVIRONMENT=$ENVIRONMENT
export IMAGE_TAG=$IMAGE_TAG

# Apply Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
envsubst < deploy/kubernetes/backend/deployment.yml | kubectl apply -f -
envsubst < deploy/kubernetes/frontend/deployment.yml | kubectl apply -f -

# Wait for rollout
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/garment-backend -n garment-$ENVIRONMENT --timeout=600s
kubectl rollout status deployment/garment-admin -n garment-$ENVIRONMENT --timeout=600s

# Run health checks
echo "🔍 Running health checks..."
./deploy/scripts/health-check.sh $ENVIRONMENT

echo "✅ Deployment completed successfully!"