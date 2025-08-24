const mysql = require('mysql2/promise');
require('dotenv').config();

// Raw MySQL connection pool (existing pattern)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// For future Sequelize integration if needed
let sequelize = null;
try {
  const { Sequelize } = require('sequelize');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} catch (error) {
  console.warn('Sequelize not properly configured, using raw MySQL pool only');
}

module.exports = { pool, sequelize };