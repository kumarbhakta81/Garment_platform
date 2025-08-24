// JWT authentication middleware for Express
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check session in DB
    const [sessions] = await pool.query('SELECT * FROM sessions WHERE token = ?', [token]);
    if (sessions.length === 0) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateJWT;
