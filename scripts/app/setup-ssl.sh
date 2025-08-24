#!/bin/bash
set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 example.com"
    exit 1
fi

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Install certbot
sudo yum install -y certbot python3-certbot-nginx

# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d $DOMAIN --agree-tos --non-interactive --email admin@$DOMAIN

# Start nginx
sudo systemctl start nginx

# Update nginx configuration for SSL
sudo certbot --nginx -d $DOMAIN --non-interactive

# Test auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ SSL setup completed for $DOMAIN!"
echo "🔒 Certificate location: /etc/letsencrypt/live/$DOMAIN/"