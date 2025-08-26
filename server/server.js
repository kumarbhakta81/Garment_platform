const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");   // ✅ should be a router
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require("./middlewares/errorHandler"); // ✅ should be a function
const { authMiddleware, logout } = require("./controllers/authController");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'Ready', timestamp: new Date().toISOString() });
});

// Logout (should be protected)
app.post("/logout", authMiddleware, logout);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
