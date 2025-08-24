const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory } = require('../controllers/categoryController');

router.get('/', getCategories); // List all categories
router.post('/', createCategory); // Create a category
router.put('/:id', updateCategory); // Edit a category

module.exports = router;
