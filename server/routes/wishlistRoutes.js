const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  getWishlistCount,
  getRecommendations
} = require('../controllers/wishlistController');
const authenticateJWT = require('../middlewares/authenticateJWT');

// All wishlist routes require authentication
router.use(authenticateJWT);

router.get('/', getWishlist); // GET /api/wishlist - Get user's wishlist
router.post('/items', addToWishlist); // POST /api/wishlist/items - Add product to wishlist
router.delete('/items/:productId', removeFromWishlist); // DELETE /api/wishlist/items/:productId - Remove product from wishlist
router.delete('/', clearWishlist); // DELETE /api/wishlist - Clear entire wishlist
router.post('/move-to-cart/:productId', moveToCart); // POST /api/wishlist/move-to-cart/:productId - Move wishlist item to cart
router.get('/count', getWishlistCount); // GET /api/wishlist/count - Get wishlist item count
router.get('/recommendations', getRecommendations); // GET /api/wishlist/recommendations - Get wishlist-based recommendations

module.exports = router;