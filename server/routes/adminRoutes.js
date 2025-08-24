const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const authenticateJWT = require('../middlewares/authenticateJWT');

// Admin middleware (for future implementation)
const adminMiddleware = (req, res, next) => {
  // For now, just check if user is authenticated
  // In production, add proper admin role checking
  next();
};

// All admin routes require authentication and admin privileges
router.use(authenticateJWT);
router.use(adminMiddleware);

// Admin product management routes
router.post('/products', createProduct); // POST /api/admin/products - Create new product
router.put('/products/:id', updateProduct); // PUT /api/admin/products/:id - Update product
router.delete('/products/:id', deleteProduct); // DELETE /api/admin/products/:id - Delete product

module.exports = router;