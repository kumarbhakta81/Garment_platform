#!/bin/bash
set -e

echo "🗄️ Installing MySQL 8.0..."

# Update system
sudo yum update -y

# Download MySQL repository
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
sudo rpm -ivh mysql80-community-release-el7-3.noarch.rpm

# Install MySQL server
sudo yum install -y mysql-server

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

echo "✅ MySQL 8.0 installation completed!"
echo "🔑 Check temporary root password with: sudo grep 'temporary password' /var/log/mysqld.log"