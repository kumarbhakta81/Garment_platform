#!/bin/bash
set -e

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

echo "🚀 Creating EC2 instance for $ENVIRONMENT environment..."

# Instance configuration
INSTANCE_TYPE=${INSTANCE_TYPE:-t3.small}
KEY_NAME="garment-platform-${ENVIRONMENT}"
SECURITY_GROUP="garment-platform-${ENVIRONMENT}-sg"

# Create key pair if it doesn't exist
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME >/dev/null 2>&1; then
    echo "📋 Creating key pair: $KEY_NAME"
    aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > ~/.ssh/${KEY_NAME}.pem
    chmod 400 ~/.ssh/${KEY_NAME}.pem
    echo "✅ Key pair created: ~/.ssh/${KEY_NAME}.pem"
fi

# Create security group if it doesn't exist
if ! aws ec2 describe-security-groups --group-names $SECURITY_GROUP >/dev/null 2>&1; then
    echo "🔒 Creating security group: $SECURITY_GROUP"
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text)
    SECURITY_GROUP_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP \
        --description "Security group for Garment Platform $ENVIRONMENT" \
        --vpc-id $VPC_ID \
        --query 'GroupId' --output text)
    
    # Add rules
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 3306 --cidr 10.0.0.0/8
    
    echo "✅ Security group created with ID: $SECURITY_GROUP_ID"
else
    SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --group-names $SECURITY_GROUP --query 'SecurityGroups[0].GroupId' --output text)
fi

# Check if instance already exists
EXISTING_INSTANCE=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=garment-platform-${ENVIRONMENT}" "Name=instance-state-name,Values=running,pending,stopped" \
    --query 'Reservations[0].Instances[0].InstanceId' --output text)

if [ "$EXISTING_INSTANCE" != "None" ] && [ -n "$EXISTING_INSTANCE" ]; then
    echo "📱 Instance already exists: $EXISTING_INSTANCE"
    INSTANCE_ID=$EXISTING_INSTANCE
    
    # Start if stopped
    STATE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].State.Name' --output text)
    if [ "$STATE" = "stopped" ]; then
        echo "🔄 Starting stopped instance..."
        aws ec2 start-instances --instance-ids $INSTANCE_ID
        aws ec2 wait instance-running --instance-ids $INSTANCE_ID
    fi
else
    # Get latest Amazon Linux 2 AMI
    AMI_ID=$(aws ec2 describe-images \
        --owners amazon \
        --filters "Name=name,Values=amzn2-ami-hvm-*" "Name=architecture,Values=x86_64" \
        --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
        --output text)

    echo "🖥️ Creating new instance with AMI: $AMI_ID"
    
    # User data script for initial setup
    USER_DATA=$(cat <<'EOF'
#!/bin/bash
yum update -y
yum install -y git wget curl

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
yum install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
amazon-linux-extras install nginx1
systemctl enable nginx

# Install MySQL 8.0
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
rpm -ivh mysql80-community-release-el7-3.noarch.rpm
yum install -y mysql-server
systemctl enable mysqld

# Install Redis
amazon-linux-extras install redis6
systemctl enable redis

# Create application user
useradd -m -s /bin/bash appuser
mkdir -p /opt/garment-platform
chown appuser:appuser /opt/garment-platform

echo "✅ Initial setup completed" > /var/log/setup.log
EOF
)

    # Create instance
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id $AMI_ID \
        --count 1 \
        --instance-type $INSTANCE_TYPE \
        --key-name $KEY_NAME \
        --security-group-ids $SECURITY_GROUP_ID \
        --user-data "$USER_DATA" \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=garment-platform-${ENVIRONMENT}},{Key=Environment,Value=${ENVIRONMENT}}]" \
        --query 'Instances[0].InstanceId' \
        --output text)

    echo "⏳ Waiting for instance to be running: $INSTANCE_ID"
    aws ec2 wait instance-running --instance-ids $INSTANCE_ID
fi

# Get instance details
PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
PRIVATE_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PrivateIpAddress' --output text)

echo "✅ EC2 Instance Ready!"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Private IP: $PRIVATE_IP"
echo ""
echo "🔑 SSH Connection:"
echo "ssh -i ~/.ssh/${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""

# Save instance details for deployment
mkdir -p /tmp/aws-output
cat > /tmp/aws-output/instance-${ENVIRONMENT}.json <<EOF
{
  "instance_id": "$INSTANCE_ID",
  "public_ip": "$PUBLIC_IP",
  "private_ip": "$PRIVATE_IP",
  "key_name": "$KEY_NAME",
  "environment": "$ENVIRONMENT"
}
EOF

echo "💾 Instance details saved to /tmp/aws-output/instance-${ENVIRONMENT}.json"