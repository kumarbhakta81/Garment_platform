const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  getProductVariants, 
  searchProducts, 
  getCategories, 
  getBrands 
} = require('../controllers/productController');

// Public product routes (no authentication required)
router.get('/', getProducts); // GET /api/products - List all products with filtering
router.get('/search', searchProducts); // GET /api/products/search - Search products
router.get('/categories', getCategories); // GET /api/products/categories - Get all categories
router.get('/brands', getBrands); // GET /api/products/brands - Get all brands
router.get('/:id', getProductById); // GET /api/products/:id - Get product details
router.get('/:id/variants', getProductVariants); // GET /api/products/:id/variants - Get product variants

module.exports = router;
