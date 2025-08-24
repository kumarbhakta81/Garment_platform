#!/bin/bash
set -e

echo "📦 Installing application dependencies..."

# Update system
sudo yum update -y
sudo yum install -y git wget curl

# Install Node.js 18
echo "🟢 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 globally
echo "⚙️ Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo amazon-linux-extras install nginx1 -y
sudo systemctl enable nginx

# Install Redis
echo "🔴 Installing Redis..."
sudo amazon-linux-extras install redis6 -y
sudo systemctl enable redis

# Create application user and directories
echo "👤 Setting up application user..."
sudo useradd -m -s /bin/bash appuser || echo "User already exists"
sudo mkdir -p /opt/garment-platform
sudo chown appuser:appuser /opt/garment-platform

echo "✅ All dependencies installed successfully!"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"