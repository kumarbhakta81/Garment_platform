#!/bin/bash
set -e

echo "🛑 Stopping all services..."

# Stop PM2 processes
pm2 stop all
echo "✅ Application stopped"

# Stop Nginx
sudo systemctl stop nginx
echo "✅ Nginx stopped"

# Stop Redis
sudo systemctl stop redis
echo "✅ Redis stopped"

# Stop MySQL
sudo systemctl stop mysqld
echo "✅ MySQL stopped"

echo "🛑 All services stopped"