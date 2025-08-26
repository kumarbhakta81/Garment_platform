const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
} = require('../controllers/categoryController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.get('/', authenticateJWT, getCategories); // List all categories
router.post('/', authenticateJWT, createCategory); // Create a category
router.put('/:id', authenticateJWT, updateCategory); // Edit a category

module.exports = router;
