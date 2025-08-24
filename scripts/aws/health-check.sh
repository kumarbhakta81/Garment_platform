#!/bin/bash
set -e

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

# Load instance details
INSTANCE_FILE="/tmp/aws-output/instance-${ENVIRONMENT}.json"
PUBLIC_IP=$(cat $INSTANCE_FILE | grep -o '"public_ip": "[^"]*' | cut -d'"' -f4)

BASE_URL="http://$PUBLIC_IP"

echo "🔍 Running health checks for $ENVIRONMENT environment..."
echo "🌐 Base URL: $BASE_URL"

# Function to check HTTP status
check_endpoint() {
    local url=$1
    local expected=$2
    local name=$3
    
    echo -n "Checking $name... "
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $url || echo "000")
    
    if [ "$status" = "$expected" ]; then
        echo "✅ OK ($status)"
        return 0
    else
        echo "❌ FAILED ($status)"
        return 1
    fi
}

# Health checks
FAILED=0

# Backend API health
check_endpoint "$BASE_URL/api/health" "200" "Backend API" || FAILED=1

# Database connectivity
check_endpoint "$BASE_URL/api/health/db" "200" "Database" || FAILED=1

# Redis connectivity  
check_endpoint "$BASE_URL/api/health/redis" "200" "Redis" || FAILED=1

# Admin portal
check_endpoint "$BASE_URL/" "200" "Admin Portal" || FAILED=1

# System checks via SSH
KEY_NAME=$(cat $INSTANCE_FILE | grep -o '"key_name": "[^"]*' | cut -d'"' -f4)
SSH_KEY="~/.ssh/${KEY_NAME}.pem"

echo -n "Checking PM2 processes... "
PM2_STATUS=$(ssh -i $SSH_KEY ec2-user@$PUBLIC_IP "pm2 jlist | jq -r '.[].pm2_env.status' | head -1" 2>/dev/null || echo "error")
if [ "$PM2_STATUS" = "online" ]; then
    echo "✅ OK"
else
    echo "❌ FAILED ($PM2_STATUS)"
    FAILED=1
fi

echo -n "Checking MySQL service... "
MYSQL_STATUS=$(ssh -i $SSH_KEY ec2-user@$PUBLIC_IP "sudo systemctl is-active mysqld" 2>/dev/null || echo "inactive")
if [ "$MYSQL_STATUS" = "active" ]; then
    echo "✅ OK"
else
    echo "❌ FAILED ($MYSQL_STATUS)"
    FAILED=1
fi

echo -n "Checking Redis service... "
REDIS_STATUS=$(ssh -i $SSH_KEY ec2-user@$PUBLIC_IP "sudo systemctl is-active redis" 2>/dev/null || echo "inactive")
if [ "$REDIS_STATUS" = "active" ]; then
    echo "✅ OK"
else
    echo "❌ FAILED ($REDIS_STATUS)"
    FAILED=1
fi

echo -n "Checking Nginx service... "
NGINX_STATUS=$(ssh -i $SSH_KEY ec2-user@$PUBLIC_IP "sudo systemctl is-active nginx" 2>/dev/null || echo "inactive")
if [ "$NGINX_STATUS" = "active" ]; then
    echo "✅ OK"
else
    echo "❌ FAILED ($NGINX_STATUS)"
    FAILED=1
fi

# System resources
echo ""
echo "📊 System Resources:"
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
echo "💾 Memory Usage:"
free -h | grep -E "(Mem|Swap)"

echo ""
echo "💽 Disk Usage:"
df -h / | tail -1

echo ""  
echo "🔥 CPU Load:"
uptime

echo ""
echo "📈 PM2 Status:"
pm2 status
EOF

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All health checks passed!"
    exit 0
else
    echo ""
    echo "❌ Some health checks failed!"
    exit 1
fi