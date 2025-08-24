resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "garment-vpc-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "garment-igw-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "garment-private-subnet-${count.index + 1}-${var.environment}"
    Environment = var.environment
    Type        = "private"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "garment-public-subnet-${count.index + 1}-${var.environment}"
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_subnet" "database" {
  count             = length(var.database_subnets)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "garment-database-subnet-${count.index + 1}-${var.environment}"
    Environment = var.environment
    Type        = "database"
  }
}

resource "aws_nat_gateway" "main" {
  count         = length(aws_subnet.public)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "garment-nat-${count.index + 1}-${var.environment}"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "nat" {
  count  = length(aws_subnet.public)
  domain = "vpc"

  tags = {
    Name        = "garment-eip-${count.index + 1}-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "garment-public-rt-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  count  = length(aws_nat_gateway.main)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name        = "garment-private-rt-${count.index + 1}-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}