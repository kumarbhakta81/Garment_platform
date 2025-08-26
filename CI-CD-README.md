# Garment Platform CI/CD Pipeline

## Overview

This repository contains a clean and maintainable CI/CD pipeline for the Garment Platform, automating the entire development lifecycle from code commit to production deployment. The pipeline handles both backend API and frontend admin portal deployments with proper testing and deployment practices.

## Pipeline Architecture

```
Developer Push → GitHub → CI/CD Pipeline → Automated Testing → Build → Deploy → Monitor
```

### Environments

- **Development**: Auto-deploy from `develop` branch
- **Staging**: Auto-deploy from `staging` branch  
- **Production**: Auto-deploy from `main` branch with manual approval

## Repository Structure

```
.github/
├── workflows/
│   ├── ci.yml                    # Continuous Integration
│   ├── cd-development.yml        # Deploy to Development
│   ├── cd-staging.yml           # Deploy to Staging
│   └── cd-production.yml        # Deploy to Production
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   └── deployment.md
└── PULL_REQUEST_TEMPLATE.md

docker/
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── admin-portal/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore

deploy/
├── kubernetes/
│   ├── namespaces/
│   ├── backend/
│   ├── frontend/
│   ├── database/
│   ├── redis/
│   └── ingress/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   └── environments/
└── scripts/
    ├── deploy.sh
    ├── rollback.sh
    ├── health-check.sh
    └── backup.sh
```

## CI/CD Workflows

### 1. Continuous Integration (ci.yml)

Triggered on pushes to `main`, `develop`, `staging` branches and pull requests.

**Jobs:**
- **Backend Testing**: Unit tests with MySQL and Redis services
- **Frontend Testing**: React tests with coverage
- **Code Quality**: ESLint, Prettier, basic security audit

### 2. Development Deployment (cd-development.yml)

Auto-deploys to development environment on pushes to `develop` branch.

**Features:**
- Simple deployment without complexity
- Health checks

### 3. Staging Deployment (cd-staging.yml)

Auto-deploys to staging environment on pushes to `staging` branch.

**Features:**
- Integration tests
- Health checks

### 4. Production Deployment (cd-production.yml)

Deploys to production on pushes to `main` branch with manual approval.

**Features:**
- Manual approval gate
- Blue-green deployment
- Post-deployment verification

## Infrastructure as Code

### Terraform Modules

- **VPC**: Network infrastructure with public/private subnets
- **EKS**: Kubernetes cluster with auto-scaling node groups
- **RDS**: MySQL database with backup and monitoring
- **S3**: Storage for images and backups
- **ElastiCache**: Redis for caching

### Kubernetes Manifests

- **Backend**: Scalable API deployment with health checks
- **Frontend**: Nginx-based React app deployment
- **Database**: MySQL with persistent storage
- **Redis**: Caching layer
- **Ingress**: ALB ingress controller for traffic routing

## Docker Configuration

### Backend (Node.js)

- Multi-stage build for optimization
- Non-root user for security
- Health checks
- Minimal attack surface

### Frontend (React + Nginx)

- Build optimization
- Security headers
- Gzip compression
- API proxy configuration

## Monitoring and Observability

### Health Checks

- Application health endpoints (`/health`, `/ready`)
- Database connectivity checks
- Redis connectivity checks
- Kubernetes liveness and readiness probes

### Metrics and Logging

- Structured logging
- Application metrics
- Infrastructure monitoring
- Performance monitoring

## Security Features

### Container Security

- Base image scanning
- Minimal base images
- Non-root users
- Read-only file systems where possible

### Secrets Management

- Kubernetes secrets for sensitive data
- AWS Secrets Manager integration
- Environment-specific configurations

### Network Security

- VPC with private subnets
- Security groups with minimal access
- Network policies in Kubernetes

## Getting Started

### Prerequisites

- AWS Account with appropriate permissions
- Docker Hub account
- GitHub repository secrets configured

### Required Secrets

Configure the following secrets in your GitHub repository:

```bash
# Docker
DOCKER_USERNAME
DOCKER_PASSWORD

# AWS
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run tests:**
   ```bash
   # Backend tests
   cd server && npm test
   
   # Frontend tests
   cd client && npm test
   ```

4. **Start development servers:**
   ```bash
   # Backend
   cd server && npm run dev
   
   # Frontend
   cd client && npm start
   ```

### Deployment

Deployments are handled automatically by GitHub Actions:

1. **Development**: Push to `develop` branch
2. **Staging**: Push to `staging` branch
3. **Production**: Push to `main` branch (requires manual approval)

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check GitHub Actions logs
   - Verify AWS credentials
   - Check Kubernetes cluster health

2. **Test Failures**
   - Ensure all dependencies are installed
   - Check environment variables
   - Verify database connectivity (for backend tests)

3. **Health Check Failures**
   - Check application logs
   - Verify service endpoints
   - Check database and Redis connectivity

### Debug Commands

```bash
# Check deployment status
kubectl get pods -n garment-<environment>

# View application logs
kubectl logs deployment/garment-backend -n garment-<environment>

# Run health checks manually
./deploy/scripts/health-check.sh <environment>
```

## Contributing

1. Create feature branch from `develop`
2. Make changes with tests
3. Ensure linting passes
4. Submit pull request
5. Address review feedback
6. Merge to `develop` for testing

## Support

For issues and questions:
- Create GitHub issue
- Check deployment logs
- Review monitoring dashboards
- Contact DevOps team

## License

This project is licensed under the ISC License.