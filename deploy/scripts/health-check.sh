#!/bin/bash
set -e

ENVIRONMENT=$1
BASE_URL="https://api-$ENVIRONMENT.garmentplatform.com"

echo "🔍 Running health checks for $ENVIRONMENT environment..."

# Backend health check
echo "Checking backend health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ "$BACKEND_STATUS" != "200" ]; then
    echo "❌ Backend health check failed (HTTP $BACKEND_STATUS)"
    exit 1
fi

# Database connectivity check
echo "Checking database connectivity..."
DB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health/db)
if [ "$DB_STATUS" != "200" ]; then
    echo "❌ Database health check failed (HTTP $DB_STATUS)"
    exit 1
fi

# Redis connectivity check
echo "Checking Redis connectivity..."
REDIS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health/redis)
if [ "$REDIS_STATUS" != "200" ]; then
    echo "❌ Redis health check failed (HTTP $REDIS_STATUS)"
    exit 1
fi

echo "✅ All health checks passed!"