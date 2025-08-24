module.exports = {
  apps: [
    {
      name: 'garment-backend',
      script: 'server.js',
      cwd: '/opt/garment-platform/backend/current',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/opt/garment-platform/logs/backend-error.log',
      out_file: '/opt/garment-platform/logs/backend-out.log',
      log_file: '/opt/garment-platform/logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Auto restart on crash
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health monitoring
      health_check: {
        url: 'http://localhost:3000/api/health',
        interval: 30000,
        timeout: 5000
      }
    }
  ]
};