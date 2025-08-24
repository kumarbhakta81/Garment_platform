const express = require('express');
const { getUsers, deleteUser, updateUser } = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, getUsers); // List users
router.delete('/:id', authenticateJWT, deleteUser); // Delete user
router.put('/:id', authenticateJWT, updateUser); // Update user

module.exports = router;
