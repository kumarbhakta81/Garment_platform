const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Health check routes (before other routes)
app.use("/api/health", healthRoutes);
app.use("/health", healthRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
