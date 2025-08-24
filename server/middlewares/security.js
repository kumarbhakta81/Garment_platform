const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    error: message
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

const strictLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  10, // limit each IP to 10 requests per windowMs
  'Too many requests, please slow down'
);

module.exports = {
  helmet: helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
  authLimiter,
  generalLimiter,
  strictLimiter
};