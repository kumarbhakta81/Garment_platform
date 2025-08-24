#!/bin/bash
set -e

echo "🌐 Setting up Nginx configuration..."

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Remove default config
sudo rm -f /etc/nginx/conf.d/default.conf

# Create nginx configuration directory for our app
sudo mkdir -p /etc/nginx/conf.d

# Test nginx configuration
sudo nginx -t

echo "✅ Nginx setup completed!"
echo "📝 Nginx configuration will be deployed during application deployment"
echo "🔧 Status: $(sudo systemctl is-active nginx)"