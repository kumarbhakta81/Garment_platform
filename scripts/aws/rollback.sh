#!/bin/bash
set -e

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

echo "🔙 Rolling back $ENVIRONMENT environment..."

# Load instance details
INSTANCE_FILE="/tmp/aws-output/instance-${ENVIRONMENT}.json"
PUBLIC_IP=$(cat $INSTANCE_FILE | grep -o '"public_ip": "[^"]*' | cut -d'"' -f4)
KEY_NAME=$(cat $INSTANCE_FILE | grep -o '"key_name": "[^"]*' | cut -d'"' -f4)
SSH_KEY="~/.ssh/${KEY_NAME}.pem"

# Get previous release
echo "🔍 Finding previous release..."
PREVIOUS_RELEASE=$(ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
cd /opt/garment-platform/backend/releases
ls -1t | sed -n '2p'
EOF
)

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "❌ No previous release found. Cannot rollback."
    exit 1
fi

echo "📦 Rolling back to release: $PREVIOUS_RELEASE"

# Rollback backend
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << EOF
# Stop current application
pm2 stop garment-backend || true

# Update symlinks to previous release
ln -sfn /opt/garment-platform/backend/releases/$PREVIOUS_RELEASE /opt/garment-platform/backend/current
ln -sfn /opt/garment-platform/admin/releases/$PREVIOUS_RELEASE/build /opt/garment-platform/admin/current

# Restart with previous configuration
cd /opt/garment-platform/backend/current
pm2 start ecosystem.config.js --env $ENVIRONMENT
pm2 save

echo "✅ Rollback completed"
EOF

# Health checks
echo "🔍 Running health checks after rollback..."
./scripts/aws/health-check.sh $ENVIRONMENT

echo "🎉 Rollback completed successfully!"
echo "🌐 Application URL: http://$PUBLIC_IP"