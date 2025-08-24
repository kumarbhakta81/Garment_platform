#!/bin/bash
set -e

echo "🚀 Starting all services..."

# Start MySQL
sudo systemctl start mysqld
echo "✅ MySQL started"

# Start Redis
sudo systemctl start redis
echo "✅ Redis started"

# Start Nginx
sudo systemctl start nginx
echo "✅ Nginx started"

# Start application with PM2
cd /opt/garment-platform/backend/current
pm2 start ecosystem.config.js
echo "✅ Application started"

# Show status
echo ""
echo "📊 Service Status:"
echo "MySQL: $(sudo systemctl is-active mysqld)"
echo "Redis: $(sudo systemctl is-active redis)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo ""
echo "📈 PM2 Status:"
pm2 status