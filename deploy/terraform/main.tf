terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "garment-platform-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# EKS Cluster Module
module "eks" {
  source = "./modules/eks"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}

# RDS Database Module
module "rds" {
  source = "./modules/rds"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.database_subnet_ids
}

# S3 Buckets for Images
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "redis" {
  name       = "garment-redis-${var.environment}"
  subnet_ids = module.vpc.private_subnet_ids
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "garment-redis-${var.environment}"
  description                = "Redis for Garment Platform"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  subnet_group_name          = aws_elasticache_subnet_group.redis.name
  security_group_ids         = [aws_security_group.redis.id]
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

resource "aws_security_group" "redis" {
  name_prefix = "garment-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "garment-redis-${var.environment}"
    Environment = var.environment
  }
}