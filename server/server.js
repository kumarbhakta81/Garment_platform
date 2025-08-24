const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const garmentRoutes = require('./routes/garments');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');

// Import middleware
const errorHandler = require("./middlewares/errorHandler");
const { helmet, generalLimiter, authLimiter } = require("./middlewares/security");

const app = express();

// Security middleware
app.use(helmet);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/garments', garmentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
