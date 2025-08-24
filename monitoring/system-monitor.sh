#!/bin/bash

# System Monitor Script for Garment Platform
# Monitors system resources and sends alerts if thresholds are exceeded

LOG_FILE="/opt/garment-platform/logs/system-monitor.log"
ALERT_EMAIL="admin@garmentplatform.com"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

check_cpu() {
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    CPU_USAGE=${CPU_USAGE%.*}  # Remove decimal part
    
    if [ "$CPU_USAGE" -gt "$CPU_THRESHOLD" ]; then
        log_message "ALERT: High CPU usage: ${CPU_USAGE}%"
        return 1
    else
        log_message "CPU usage normal: ${CPU_USAGE}%"
        return 0
    fi
}

check_memory() {
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", ($3/$2) * 100.0}')
    
    if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
        log_message "ALERT: High memory usage: ${MEMORY_USAGE}%"
        return 1
    else
        log_message "Memory usage normal: ${MEMORY_USAGE}%"
        return 0
    fi
}

check_disk() {
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
        log_message "ALERT: High disk usage: ${DISK_USAGE}%"
        return 1
    else
        log_message "Disk usage normal: ${DISK_USAGE}%"
        return 0
    fi
}

check_services() {
    FAILED_SERVICES=""
    
    # Check MySQL
    if ! sudo systemctl is-active mysqld >/dev/null 2>&1; then
        FAILED_SERVICES="$FAILED_SERVICES MySQL"
        log_message "ALERT: MySQL service is down"
    fi
    
    # Check Redis
    if ! sudo systemctl is-active redis >/dev/null 2>&1; then
        FAILED_SERVICES="$FAILED_SERVICES Redis"
        log_message "ALERT: Redis service is down"
    fi
    
    # Check Nginx
    if ! sudo systemctl is-active nginx >/dev/null 2>&1; then
        FAILED_SERVICES="$FAILED_SERVICES Nginx"
        log_message "ALERT: Nginx service is down"
    fi
    
    # Check PM2 processes
    if ! pm2 list | grep -q "online"; then
        FAILED_SERVICES="$FAILED_SERVICES Application"
        log_message "ALERT: Application processes are down"
    fi
    
    if [ -n "$FAILED_SERVICES" ]; then
        log_message "ALERT: Failed services:$FAILED_SERVICES"
        return 1
    else
        log_message "All services running normally"
        return 0
    fi
}

send_alert() {
    local message="$1"
    log_message "Sending alert: $message"
    
    # You can integrate with your preferred notification system here
    # Examples:
    # - Send email via sendmail/postfix
    # - Send to Slack webhook
    # - Send to PagerDuty
    # - Send SMS via AWS SNS
    
    echo "$message" | mail -s "Garment Platform Alert" $ALERT_EMAIL 2>/dev/null || true
}

main() {
    log_message "Starting system monitoring check"
    
    ALERTS=()
    
    # Run all checks
    if ! check_cpu; then
        ALERTS+=("High CPU usage detected")
    fi
    
    if ! check_memory; then
        ALERTS+=("High memory usage detected")
    fi
    
    if ! check_disk; then
        ALERTS+=("High disk usage detected")
    fi
    
    if ! check_services; then
        ALERTS+=("Service failures detected")
    fi
    
    # Send alerts if any issues found
    if [ ${#ALERTS[@]} -gt 0 ]; then
        alert_message="Garment Platform System Alerts:\n"
        for alert in "${ALERTS[@]}"; do
            alert_message="${alert_message}- $alert\n"
        done
        alert_message="${alert_message}\nTime: $(date)\nServer: $(hostname)"
        
        send_alert "$alert_message"
        log_message "Monitoring completed with ${#ALERTS[@]} alerts"
        exit 1
    else
        log_message "Monitoring completed - all systems normal"
        exit 0
    fi
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main