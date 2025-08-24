# Garment Platform - EC2 CI/CD Deployment

A simple garment management platform with automated CI/CD deployment to AWS EC2 instances.

## Architecture

```
GitHub → GitHub Actions → EC2 Instance (All-in-One)
├── Node.js Backend (PM2)
├── React Admin Portal (Nginx)
├── MySQL Database (Local)
├── Redis Cache (Local)
└── Nginx Load Balancer
```

## Quick Start

### Prerequisites

1. AWS Account with EC2 access
2. GitHub repository with Actions enabled
3. Domain name (optional, for SSL)

### GitHub Secrets Setup

Configure these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
DB_PASSWORD=GarmentApp2024!
DB_PASSWORD_STAGING=GarmentApp2024!
DB_PASSWORD_PROD=SecureProductionPassword2024!
JWT_SECRET=your-jwt-secret-for-dev
JWT_SECRET_STAGING=your-jwt-secret-for-staging
JWT_SECRET_PROD=your-secure-production-jwt-secret
SLACK_WEBHOOK=your-slack-webhook-url (optional)
SNYK_TOKEN=your-snyk-token (optional)
```

### Deployment

#### Development Environment
Push to `develop` branch:
```bash
git checkout develop
git push origin develop
```

#### Staging Environment
Push to `staging` branch:
```bash
git checkout staging
git push origin staging
```

#### Production Environment
Push to `main` branch (requires manual approval):
```bash
git checkout main
git push origin main
```

## Manual Deployment

### 1. Create EC2 Instance
```bash
chmod +x scripts/aws/create-ec2.sh
./scripts/aws/create-ec2.sh development
```

### 2. Setup Instance
```bash
chmod +x scripts/aws/setup-instance.sh
./scripts/aws/setup-instance.sh development
```

### 3. Deploy Application
```bash
chmod +x scripts/aws/deploy.sh
./scripts/aws/deploy.sh development
```

### 4. Health Check
```bash
chmod +x scripts/aws/health-check.sh
./scripts/aws/health-check.sh development
```

## Monitoring

### System Monitor
```bash
# Run system monitoring check
./monitoring/system-monitor.sh

# Setup cron job for monitoring (every 5 minutes)
echo "*/5 * * * * /opt/garment-platform/monitoring/system-monitor.sh" | crontab -
```

### Application Health Check
```bash
# Run application health check
node monitoring/health-check.js
```

### Log Rotation
```bash
# Setup log rotation
sudo cp monitoring/log-rotation.conf /etc/logrotate.d/garment-platform
```

## Service Management

### Start Services
```bash
./deploy/scripts/start.sh
```

### Stop Services
```bash
./deploy/scripts/stop.sh
```

### Restart Services
```bash
./deploy/scripts/restart.sh
```

### Check Status
```bash
./deploy/scripts/status.sh
```

## Rollback

### Rollback to Previous Release
```bash
./scripts/aws/rollback.sh production
```

## Database Management

### Backup Database
```bash
./scripts/database/backup.sh production
```

### Run Migrations
```bash
./scripts/database/migrate.sh development
```

## SSL Setup (Optional)

```bash
# Setup SSL certificate with Let's Encrypt
./scripts/app/setup-ssl.sh yourdomain.com
```

## Access URLs

After deployment, access your application:

- **Application**: http://your-ec2-public-ip
- **API Health**: http://your-ec2-public-ip/api/health
- **Database Health**: http://your-ec2-public-ip/api/health/db

## Environment Variables

### Development
```bash
NODE_ENV=development
DB_NAME=garment_platform_dev
JWT_SECRET=dev-jwt-secret
```

### Staging
```bash
NODE_ENV=staging
DB_NAME=garment_platform_staging
JWT_SECRET=staging-jwt-secret
```

### Production
```bash
NODE_ENV=production
DB_NAME=garment_platform_prod
JWT_SECRET=production-jwt-secret
```

## Troubleshooting

### Check Logs
```bash
# Application logs
tail -f /opt/garment-platform/logs/backend-error.log

# System logs
tail -f /var/log/mysqld.log
tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs
```

### Common Issues

1. **MySQL Connection Failed**: Check if MySQL is running and credentials are correct
2. **Permission Denied**: Ensure scripts are executable (`chmod +x script.sh`)
3. **Port Already in Use**: Check if another process is using port 3000
4. **Health Check Failed**: Verify all services are running with `./deploy/scripts/status.sh`

## Cost Estimates

### AWS Resources (Monthly)
- **t3.small EC2**: ~$15-20/month
- **EBS Storage (20GB)**: ~$2/month
- **Data Transfer**: ~$1-5/month
- **Total**: ~$18-27/month

### Scaling Options
- Upgrade to t3.medium for higher traffic
- Add ELB for load balancing
- Use RDS for managed database
- Add CloudWatch for advanced monitoring

## Security Considerations

1. **Change default passwords** in production
2. **Enable SSL** for production deployments
3. **Restrict security groups** to necessary ports
4. **Use IAM roles** instead of access keys when possible
5. **Enable CloudTrail** for audit logging
6. **Regular security updates** via automated patches

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review application and system logs
3. Run health checks to identify problems
4. Use the rollback feature if needed