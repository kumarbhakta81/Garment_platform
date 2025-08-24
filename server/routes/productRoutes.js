const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct } = require('../controllers/productController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.get('/', authenticateJWT, getProducts); // List all products
router.post('/', authenticateJWT, createProduct); // Create a product
router.put('/:id', authenticateJWT, updateProduct); // Edit a product

module.exports = router;
