#!/bin/bash
set -e

ENVIRONMENT=$1
REVISION=$2

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment> [revision]"
    exit 1
fi

echo "🔄 Rolling back $ENVIRONMENT environment..."

if [ -n "$REVISION" ]; then
    echo "Rolling back to revision $REVISION..."
    kubectl rollout undo deployment/garment-backend --to-revision=$REVISION -n garment-$ENVIRONMENT
    kubectl rollout undo deployment/garment-admin --to-revision=$REVISION -n garment-$ENVIRONMENT
else
    echo "Rolling back to previous revision..."
    kubectl rollout undo deployment/garment-backend -n garment-$ENVIRONMENT
    kubectl rollout undo deployment/garment-admin -n garment-$ENVIRONMENT
fi

# Wait for rollback to complete
echo "⏳ Waiting for rollback to complete..."
kubectl rollout status deployment/garment-backend -n garment-$ENVIRONMENT --timeout=600s
kubectl rollout status deployment/garment-admin -n garment-$ENVIRONMENT --timeout=600s

# Run health checks
echo "🔍 Running health checks..."
./deploy/scripts/health-check.sh $ENVIRONMENT

echo "✅ Rollback completed successfully!"