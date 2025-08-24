#!/bin/bash
set -e

echo "🔄 Restarting all services..."

# Restart MySQL
sudo systemctl restart mysqld
echo "✅ MySQL restarted"

# Restart Redis
sudo systemctl restart redis
echo "✅ Redis restarted"

# Restart Nginx
sudo systemctl restart nginx
echo "✅ Nginx restarted"

# Restart application with PM2
pm2 restart all
echo "✅ Application restarted"

# Show status
echo ""
echo "📊 Service Status:"
echo "MySQL: $(sudo systemctl is-active mysqld)"
echo "Redis: $(sudo systemctl is-active redis)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo ""
echo "📈 PM2 Status:"
pm2 status