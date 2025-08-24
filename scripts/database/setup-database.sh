#!/bin/bash
set -e

echo "🔧 Setting up MySQL databases and users..."

# Get temporary root password
TEMP_PASS=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')

if [ -z "$TEMP_PASS" ]; then
    echo "❌ Could not find MySQL temporary password"
    exit 1
fi

echo "🔑 Found temporary password, setting up MySQL..."

# Setup MySQL
mysql -u root -p"$TEMP_PASS" --connect-expired-password << 'EOF'
-- Set root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'GarmentPlatform2024!';

-- Create databases
CREATE DATABASE IF NOT EXISTS garment_platform_dev;
CREATE DATABASE IF NOT EXISTS garment_platform_staging;
CREATE DATABASE IF NOT EXISTS garment_platform_prod;

-- Create application user
CREATE USER IF NOT EXISTS 'garment_user'@'localhost' IDENTIFIED BY 'GarmentApp2024!';

-- Grant privileges
GRANT ALL PRIVILEGES ON garment_platform_*.* TO 'garment_user'@'localhost';
FLUSH PRIVILEGES;

-- Show databases
SHOW DATABASES;
EOF

echo "✅ MySQL database setup completed!"
echo "📊 Databases created: garment_platform_dev, garment_platform_staging, garment_platform_prod"
echo "👤 User created: garment_user"