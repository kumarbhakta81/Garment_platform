const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductStatus, 
  getProductAnalytics 
} = require('../controllers/productController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { uploadProductImages, handleUploadError } = require('../middlewares/uploadMiddleware');
const { productValidationRules, statusValidationRules, handleValidationErrors } = require('../middlewares/validation');
const { uploadLimiter } = require('../middlewares/rateLimiting');

router.get('/', authenticateJWT, getProducts); // List all products with filtering
router.post('/', authenticateJWT, uploadLimiter, uploadProductImages, handleUploadError, productValidationRules(), handleValidationErrors, createProduct); // Create a product with images
router.put('/:id', authenticateJWT, uploadLimiter, uploadProductImages, handleUploadError, productValidationRules(), handleValidationErrors, updateProduct); // Edit a product
router.delete('/:id', authenticateJWT, deleteProduct); // Delete a product
router.patch('/:id/status', authenticateJWT, statusValidationRules(), handleValidationErrors, updateProductStatus); // Approve/reject product (admin)
router.get('/analytics', authenticateJWT, getProductAnalytics); // Get analytics for wholesaler

module.exports = router;
