const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middlewares/authenticateJWT');
const validation = require('../middlewares/validation');

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// Wishlist routes
router.post('/add', validation.addToWishlist, wishlistController.addToWishlist);
router.delete('/remove/:garmentId', validation.garmentIdParam, wishlistController.removeFromWishlist);
router.get('/', wishlistController.getWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.post('/move-to-cart', validation.moveToCart, wishlistController.moveToCart);
router.get('/check/:garmentId', validation.garmentIdParam, wishlistController.checkWishlistItem);

module.exports = router;