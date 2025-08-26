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

router.get('/', authenticateJWT, getProducts); // List all products with filtering
router.post('/', authenticateJWT, uploadProductImages, handleUploadError, createProduct); // Create a product with images
router.put('/:id', authenticateJWT, uploadProductImages, handleUploadError, updateProduct); // Edit a product
router.delete('/:id', authenticateJWT, deleteProduct); // Delete a product
router.patch('/:id/status', authenticateJWT, updateProductStatus); // Approve/reject product (admin)
router.get('/analytics', authenticateJWT, getProductAnalytics); // Get analytics for wholesaler

module.exports = router;
