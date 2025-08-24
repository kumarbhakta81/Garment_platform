output "bucket_name" {
  description = "Name of the S3 bucket for images"
  value       = aws_s3_bucket.images.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 bucket for images"
  value       = aws_s3_bucket.images.arn
}

output "backup_bucket_name" {
  description = "Name of the S3 bucket for backups"
  value       = aws_s3_bucket.backups.bucket
}

output "backup_bucket_arn" {
  description = "ARN of the S3 bucket for backups"
  value       = aws_s3_bucket.backups.arn
}