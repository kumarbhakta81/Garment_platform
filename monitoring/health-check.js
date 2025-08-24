const http = require('http');
const mysql = require('mysql2/promise');
const redis = require('redis');
require('dotenv').config();

class HealthChecker {
  constructor() {
    this.checks = [];
    this.setupChecks();
  }

  setupChecks() {
    // Application health check
    this.addCheck('application', this.checkApplication.bind(this));
    
    // Database health check
    this.addCheck('database', this.checkDatabase.bind(this));
    
    // Redis health check
    this.addCheck('redis', this.checkRedis.bind(this));
    
    // System resources check
    this.addCheck('system', this.checkSystem.bind(this));
  }

  addCheck(name, checkFunction) {
    this.checks.push({ name, check: checkFunction });
  }

  async checkApplication() {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${process.env.PORT || 3000}/api/health`, (res) => {
        resolve({
          status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
          statusCode: res.statusCode,
          message: `Application responding with status ${res.statusCode}`
        });
      });

      req.on('error', (error) => {
        resolve({
          status: 'unhealthy',
          message: `Application not responding: ${error.message}`
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          status: 'unhealthy',
          message: 'Application health check timeout'
        });
      });
    });
  }

  async checkDatabase() {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'garment_user',
        password: process.env.DB_PASSWORD || 'GarmentApp2024!',
        database: process.env.DB_NAME || 'garment_platform_dev'
      });

      await connection.execute('SELECT 1');
      await connection.end();

      return {
        status: 'healthy',
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`
      };
    }
  }

  async checkRedis() {
    try {
      const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      await client.connect();
      await client.ping();
      await client.disconnect();

      return {
        status: 'healthy',
        message: 'Redis connection successful'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Redis connection failed: ${error.message}`
      };
    }
  }

  async checkSystem() {
    const os = require('os');
    const fs = require('fs').promises;

    try {
      // Check memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = (usedMem / totalMem) * 100;

      // Check disk usage
      const stats = await fs.stat('/');
      
      // Check CPU load
      const loadAvg = os.loadavg();

      const isHealthy = memUsagePercent < 90 && loadAvg[0] < os.cpus().length * 2;

      return {
        status: isHealthy ? 'healthy' : 'warning',
        message: `Memory: ${memUsagePercent.toFixed(1)}%, CPU Load: ${loadAvg[0].toFixed(2)}`,
        details: {
          memory: {
            total: Math.round(totalMem / 1024 / 1024 / 1024),
            used: Math.round(usedMem / 1024 / 1024 / 1024),
            percent: memUsagePercent.toFixed(1)
          },
          cpu: {
            cores: os.cpus().length,
            loadAverage: loadAvg
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `System check failed: ${error.message}`
      };
    }
  }

  async runAllChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {}
    };

    for (const { name, check } of this.checks) {
      try {
        console.log(`Running ${name} health check...`);
        const result = await check();
        results.checks[name] = result;

        if (result.status === 'unhealthy') {
          results.overall = 'unhealthy';
        } else if (result.status === 'warning' && results.overall !== 'unhealthy') {
          results.overall = 'warning';
        }

        console.log(`${name}: ${result.status} - ${result.message}`);
      } catch (error) {
        results.checks[name] = {
          status: 'unhealthy',
          message: `Health check failed: ${error.message}`
        };
        results.overall = 'unhealthy';
        console.error(`${name} health check failed:`, error.message);
      }
    }

    return results;
  }
}

// Export for use as module
module.exports = HealthChecker;

// Run if called directly
if (require.main === module) {
  const checker = new HealthChecker();
  
  checker.runAllChecks()
    .then(results => {
      console.log('\n📊 Health Check Results:');
      console.log('========================');
      console.log(`Overall Status: ${results.overall.toUpperCase()}`);
      console.log(`Timestamp: ${results.timestamp}`);
      console.log('\nDetailed Results:');
      console.log(JSON.stringify(results, null, 2));
      
      // Exit with appropriate code
      process.exit(results.overall === 'healthy' ? 0 : 1);
    })
    .catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
}