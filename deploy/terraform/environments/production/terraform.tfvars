environment = "production"
vpc_cidr = "10.2.0.0/16"

# EKS Configuration
eks_node_instance_type = "t3.medium"
eks_node_desired_capacity = 3
eks_node_max_capacity = 6
eks_node_min_capacity = 2

# RDS Configuration
rds_instance_class = "db.t3.medium"
rds_allocated_storage = 50
rds_max_allocated_storage = 200