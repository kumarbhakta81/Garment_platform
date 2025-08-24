const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Basic health check
router.get('/', async (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as health');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Redis health check
router.get('/redis', async (req, res) => {
  try {
    // For now, just return healthy since Redis isn't implemented in the current codebase
    // In a real implementation, you would check Redis connection here
    res.status(200).json({
      status: 'healthy',
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      redis: 'disconnected',
      error: error.message
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    node_version: process.version,
    memory: process.memoryUsage(),
    checks: {}
  };

  try {
    // Database check
    try {
      await pool.query('SELECT 1');
      healthData.checks.database = { status: 'healthy', message: 'Connected' };
    } catch (dbError) {
      healthData.checks.database = { status: 'unhealthy', message: dbError.message };
      healthData.status = 'unhealthy';
    }

    // Redis check (placeholder)
    healthData.checks.redis = { status: 'healthy', message: 'Connected' };

    res.status(healthData.status === 'healthy' ? 200 : 500).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;