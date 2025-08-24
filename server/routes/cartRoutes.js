const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
  moveToWishlist,
  validateCart
} = require('../controllers/cartController');
const authenticateJWT = require('../middlewares/authenticateJWT');

// All cart routes require authentication
router.use(authenticateJWT);

router.get('/', getCart); // GET /api/cart - Get user's cart
router.post('/items', addToCart); // POST /api/cart/items - Add product variant to cart
router.put('/items/:itemId', updateCartItem); // PUT /api/cart/items/:itemId - Update cart item quantity
router.delete('/items/:itemId', removeCartItem); // DELETE /api/cart/items/:itemId - Remove specific cart item (Challenge Solution)
router.delete('/', clearCart); // DELETE /api/cart - Clear entire cart
router.get('/summary', getCartSummary); // GET /api/cart/summary - Get cart summary and totals
router.post('/move-to-wishlist/:itemId', moveToWishlist); // POST /api/cart/move-to-wishlist/:itemId - Move cart item to wishlist
router.get('/validate', validateCart); // GET /api/cart/validate - Validate cart items

module.exports = router;