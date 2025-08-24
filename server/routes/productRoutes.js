const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct } = require('../controllers/productController');

router.get('/', getProducts); // List all products
router.post('/', createProduct); // Create a product
router.put('/:id', updateProduct); // Edit a product

module.exports = router;
