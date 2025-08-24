const pool = require('../config/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const [result] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connected successfully:', result);
    
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📋 Current tables:', tables);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
  }
  
  process.exit(0);
}

testConnection().catch(console.error);