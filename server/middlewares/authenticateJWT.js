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
    // Check session in DB and get user role
    const [sessions] = await pool.query(`
      SELECT s.*, u.role 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ? AND s.expires_at > NOW()
    `, [token]);
    
    if (sessions.length === 0) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }
    
    // Add role to user object
    req.user = { ...decoded, role: sessions[0].role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = authenticateJWT;
module.exports.requireRole = requireRole;
