environment = "dev"
vpc_cidr = "10.0.0.0/16"

# EKS Configuration
eks_node_instance_type = "t3.small"
eks_node_desired_capacity = 1
eks_node_max_capacity = 2
eks_node_min_capacity = 1

# RDS Configuration
rds_instance_class = "db.t3.micro"
rds_allocated_storage = 20
rds_max_allocated_storage = 50