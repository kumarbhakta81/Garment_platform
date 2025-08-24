#!/bin/bash
set -e

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

echo "💾 Creating database backup for $ENVIRONMENT..."

# Load instance details
INSTANCE_FILE="/tmp/aws-output/instance-${ENVIRONMENT}.json"
PUBLIC_IP=$(cat $INSTANCE_FILE | grep -o '"public_ip": "[^"]*' | cut -d'"' -f4)
KEY_NAME=$(cat $INSTANCE_FILE | grep -o '"key_name": "[^"]*' | cut -d'"' -f4)
SSH_KEY="~/.ssh/${KEY_NAME}.pem"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="garment_platform_${ENVIRONMENT}_${TIMESTAMP}.sql"

echo "📤 Creating backup: $BACKUP_FILE"

ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << EOF
# Create backup directory
mkdir -p /opt/garment-platform/backups

# Create database backup
mysqldump -u garment_user -pGarmentApp2024! garment_platform_${ENVIRONMENT} > /opt/garment-platform/backups/$BACKUP_FILE

# Compress backup
gzip /opt/garment-platform/backups/$BACKUP_FILE

# Keep only last 10 backups
cd /opt/garment-platform/backups
ls -1t *.sql.gz | tail -n +11 | xargs -r rm

echo "✅ Backup created: $BACKUP_FILE.gz"
ls -lh /opt/garment-platform/backups/$BACKUP_FILE.gz
EOF

echo "🎉 Database backup completed!"