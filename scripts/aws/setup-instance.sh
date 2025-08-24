#!/bin/bash
set -e

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

echo "🔧 Setting up instance for $ENVIRONMENT environment..."

# Load instance details
INSTANCE_FILE="/tmp/aws-output/instance-${ENVIRONMENT}.json"
if [ ! -f "$INSTANCE_FILE" ]; then
    echo "❌ Instance file not found. Run create-ec2.sh first."
    exit 1
fi

PUBLIC_IP=$(cat $INSTANCE_FILE | grep -o '"public_ip": "[^"]*' | cut -d'"' -f4)
KEY_NAME=$(cat $INSTANCE_FILE | grep -o '"key_name": "[^"]*' | cut -d'"' -f4)
SSH_KEY="~/.ssh/${KEY_NAME}.pem"

echo "📡 Connecting to instance: $PUBLIC_IP"

# Wait for SSH to be ready
echo "⏳ Waiting for SSH to be ready..."
for i in {1..30}; do
    if ssh -i $SSH_KEY -o ConnectTimeout=5 -o StrictHostKeyChecking=no ec2-user@$PUBLIC_IP "echo 'SSH Ready'" 2>/dev/null; then
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 10
done

# Setup MySQL
echo "🗄️ Setting up MySQL..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
sudo systemctl start mysqld

# Get temporary root password
TEMP_PASS=$(sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')

# Setup MySQL root password and create databases
mysql -u root -p"$TEMP_PASS" --connect-expired-password << 'MYSQL_SETUP'
ALTER USER 'root'@'localhost' IDENTIFIED BY 'GarmentPlatform2024!';
CREATE DATABASE garment_platform_dev;
CREATE DATABASE garment_platform_staging;
CREATE DATABASE garment_platform_prod;
CREATE USER 'garment_user'@'localhost' IDENTIFIED BY 'GarmentApp2024!';
GRANT ALL PRIVILEGES ON garment_platform_*.* TO 'garment_user'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SETUP

echo "✅ MySQL setup completed"
EOF

# Setup Redis
echo "🔴 Setting up Redis..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
sudo systemctl start redis
sudo systemctl status redis
echo "✅ Redis setup completed"
EOF

# Setup application directories
echo "📁 Setting up application directories..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
sudo mkdir -p /opt/garment-platform/{backend,admin,logs,backups}
sudo chown -R ec2-user:ec2-user /opt/garment-platform
mkdir -p /opt/garment-platform/backend/releases
mkdir -p /opt/garment-platform/admin/releases
echo "✅ Application directories created"
EOF

# Setup Nginx
echo "🌐 Setting up Nginx..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
sudo systemctl start nginx
sudo systemctl enable nginx

# Remove default config
sudo rm -f /etc/nginx/conf.d/default.conf

echo "✅ Nginx setup completed"
EOF

# Setup PM2
echo "⚙️ Setting up PM2..."
ssh -i $SSH_KEY ec2-user@$PUBLIC_IP << 'EOF'
# Configure PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "✅ PM2 setup completed"
EOF

echo "🎉 Instance setup completed successfully!"
echo "🔑 SSH Command: ssh -i $SSH_KEY ec2-user@$PUBLIC_IP"