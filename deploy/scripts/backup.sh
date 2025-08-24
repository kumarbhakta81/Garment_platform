#!/bin/bash
set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

echo "📦 Creating backup for $ENVIRONMENT environment..."

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
echo "Backing up database..."
kubectl exec -n garment-$ENVIRONMENT deployment/mysql -- mysqldump \
    -u root -p$MYSQL_ROOT_PASSWORD garment_platform > backup_${ENVIRONMENT}_${TIMESTAMP}.sql

# Upload to S3
echo "Uploading backup to S3..."
aws s3 cp backup_${ENVIRONMENT}_${TIMESTAMP}.sql s3://garment-platform-backups/$ENVIRONMENT/

# Cleanup local backup
rm backup_${ENVIRONMENT}_${TIMESTAMP}.sql

echo "✅ Backup completed successfully!"