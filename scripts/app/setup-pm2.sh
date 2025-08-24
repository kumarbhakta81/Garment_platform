#!/bin/bash
set -e

echo "⚙️ Setting up PM2 configuration..."

# Configure PM2 startup
pm2 startup

# Install PM2 logrotate
pm2 install pm2-logrotate

# Set PM2 logrotate configuration
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Save current PM2 configuration
pm2 save

echo "✅ PM2 setup completed!"
echo "📊 PM2 status:"
pm2 status