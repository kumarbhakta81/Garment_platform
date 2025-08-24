resource "aws_db_subnet_group" "main" {
  name       = "garment-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "garment-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "garment-${var.environment}-rds-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "garment-${var.environment}-rds-sg"
    Environment = var.environment
  }
}

resource "aws_db_parameter_group" "main" {
  name   = "garment-${var.environment}-mysql8"
  family = "mysql8.0"

  parameter {
    name  = "innodb_buffer_pool_size"
    value = "{DBInstanceClassMemory*3/4}"
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }

  tags = {
    Name        = "garment-${var.environment}-mysql8"
    Environment = var.environment
  }
}

resource "aws_db_instance" "main" {
  identifier = "garment-${var.environment}-db"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "garment_platform"
  username = "admin"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = var.environment == "production" ? 7 : 3
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  skip_final_snapshot       = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "garment-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  performance_insights_enabled = var.environment == "production"
  monitoring_interval         = var.environment == "production" ? 60 : 0
  monitoring_role_arn        = var.environment == "production" ? aws_iam_role.rds_enhanced_monitoring[0].arn : null

  deletion_protection = var.environment == "production"

  tags = {
    Name        = "garment-${var.environment}-db"
    Environment = var.environment
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

resource "aws_secretsmanager_secret" "db_password" {
  name = "garment-${var.environment}-db-password"

  tags = {
    Name        = "garment-${var.environment}-db-password"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = aws_db_instance.main.username
    password = random_password.db_password.result
    engine   = "mysql"
    host     = aws_db_instance.main.endpoint
    port     = aws_db_instance.main.port
    dbname   = aws_db_instance.main.db_name
  })
}

resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.environment == "production" ? 1 : 0
  name  = "garment-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Name        = "garment-${var.environment}-rds-monitoring-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count      = var.environment == "production" ? 1 : 0
  role       = aws_iam_role.rds_enhanced_monitoring[count.index].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}