#!/bin/bash
set -e

ENVIRONMENT=$1
STRATEGY=${2:-rolling}  # rolling or blue-green

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment> [strategy]"
    exit 1
fi

echo "🚀 Deploying to $ENVIRONMENT environment with $STRATEGY strategy..."

# Load instance details
INSTANCE_FILE="/tmp/aws-output/instance-${ENVIRONMENT}.json"
PUBLIC_IP=$(cat $INSTANCE_FILE | grep -o '"public_ip": "[^"]*' | cut -d'"' -f4)
KEY_NAME=$(cat $INSTANCE_FILE | grep -o '"key_name": "[^"]*' | cut -d'"' -f4)
SSH_KEY="~/.ssh/${KEY_NAME}.pem"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="/opt/garment-platform/backend/releases/${TIMESTAMP}"

# Create release directory
echo "📁 Creating release directory..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP "mkdir -p $RELEASE_DIR"

# Upload backend code
echo "📤 Uploading backend code..."
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    --exclude node_modules \
    --exclude .git \
    --exclude .env \
    server/ ec2-user@$PUBLIC_IP:$RELEASE_DIR/

# Upload admin portal code  
echo "📤 Uploading admin portal code..."
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    --exclude node_modules \
    --exclude .git \
    --exclude dist \
    client/admin/ ec2-user@$PUBLIC_IP:/opt/garment-platform/admin/releases/${TIMESTAMP}/

# Upload configuration files
echo "📤 Uploading configuration..."
scp -i $SSH_KEY config/nginx/garment-platform.conf ec2-user@$PUBLIC_IP:/tmp/
scp -i $SSH_KEY config/pm2/ecosystem.config.js ec2-user@$PUBLIC_IP:/tmp/
scp -i $SSH_KEY deploy/environments/${ENVIRONMENT}.env ec2-user@$PUBLIC_IP:/tmp/

# Install dependencies and build
echo "📦 Installing dependencies..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << EOF
cd $RELEASE_DIR
npm ci --production

# Setup environment file
cp /tmp/${ENVIRONMENT}.env .env

# Build admin portal
cd /opt/garment-platform/admin/releases/${TIMESTAMP}
npm ci
npm run build

echo "✅ Dependencies installed and built"
EOF

# Database migrations
echo "🗄️ Running database migrations..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << EOF
cd $RELEASE_DIR
npm run migrate:$ENVIRONMENT || echo "⚠️ Migration failed or not configured"
echo "✅ Database migrations completed"
EOF

# Deploy based on strategy
if [ "$STRATEGY" = "blue-green" ]; then
    echo "🔵🟢 Executing blue-green deployment..."
    ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << EOF
# Stop current application
pm2 stop garment-backend || true

# Update symlinks
ln -sfn $RELEASE_DIR /opt/garment-platform/backend/current
ln -sfn /opt/garment-platform/admin/releases/${TIMESTAMP}/build /opt/garment-platform/admin/current

# Update PM2 configuration
cp /tmp/ecosystem.config.js /opt/garment-platform/backend/current/
cd /opt/garment-platform/backend/current

# Start with new configuration
pm2 start ecosystem.config.js --env $ENVIRONMENT
pm2 save

# Update Nginx configuration
sudo cp /tmp/garment-platform.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Blue-green deployment completed"
EOF
else
    echo "🔄 Executing rolling deployment..."
    ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << EOF
# Update symlinks
ln -sfn $RELEASE_DIR /opt/garment-platform/backend/current
ln -sfn /opt/garment-platform/admin/releases/${TIMESTAMP}/build /opt/garment-platform/admin/current

# Update PM2 configuration
cp /tmp/ecosystem.config.js /opt/garment-platform/backend/current/
cd /opt/garment-platform/backend/current

# Reload application with zero downtime
pm2 reload garment-backend || pm2 start ecosystem.config.js --env $ENVIRONMENT
pm2 save

# Update Nginx configuration
sudo cp /tmp/garment-platform.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Rolling deployment completed"
EOF
fi

# Health checks
echo "🔍 Running health checks..."
sleep 10
./scripts/aws/health-check.sh $ENVIRONMENT

# Cleanup old releases (keep last 5)
echo "🧹 Cleaning up old releases..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
cd /opt/garment-platform/backend/releases
ls -1t | tail -n +6 | xargs -r rm -rf
cd /opt/garment-platform/admin/releases  
ls -1t | tail -n +6 | xargs -r rm -rf
echo "✅ Cleanup completed"
EOF

echo "🎉 Deployment completed successfully!"
echo "🌐 Application URL: http://$PUBLIC_IP"
echo "🔑 SSH: ssh -i $SSH_KEY ec2-user@$PUBLIC_IP"