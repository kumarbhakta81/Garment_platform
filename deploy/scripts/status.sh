#!/bin/bash

echo "📊 Service Status Check"
echo "======================="

# Check MySQL
echo -n "MySQL: "
if sudo systemctl is-active mysqld >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

# Check Redis
echo -n "Redis: "
if sudo systemctl is-active redis >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

# Check Nginx
echo -n "Nginx: "
if sudo systemctl is-active nginx >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Stopped"
fi

# Check PM2 processes
echo ""
echo "📈 PM2 Application Status:"
pm2 status

# Check system resources
echo ""
echo "💾 System Resources:"
echo "Memory Usage:"
free -h | grep -E "(Mem|Swap)"

echo ""
echo "💽 Disk Usage:"
df -h / | tail -1

echo ""
echo "🔥 CPU Load:"
uptime

# Check logs for errors
echo ""
echo "🔍 Recent Error Logs:"
echo "Application errors (last 5 lines):"
tail -5 /opt/garment-platform/logs/backend-error.log 2>/dev/null || echo "No error log found"

echo ""
echo "MySQL errors (last 5 lines):"
sudo tail -5 /var/log/mysqld.log 2>/dev/null | grep -i error || echo "No recent MySQL errors"