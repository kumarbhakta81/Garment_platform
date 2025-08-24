const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authenticateJWT');
const validation = require('../middlewares/validation');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// Cart routes
router.post('/add', validation.addToCart, cartController.addToCart);
router.put('/update', validation.updateCart, cartController.updateCartItem);
router.get('/', cartController.getCart);
router.delete('/remove/:variantId', validation.variantIdParam, cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);
router.get('/total', cartController.getCartTotal);

module.exports = router;