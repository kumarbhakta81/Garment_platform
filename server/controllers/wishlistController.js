const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Standardized response helper
const sendResponse = (res, success, data = null, message = '', statusCode = 200) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Get user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.findByUserId(userId);
    
    sendResponse(res, true, { wishlist: wishlistItems }, 'Wishlist retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;
    
    if (!product_id) {
      return sendResponse(res, false, null, 'Product ID is required', 400);
    }

    // Verify product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return sendResponse(res, false, null, 'Product not found', 404);
    }

    const wishlistItem = await Wishlist.addItem(userId, product_id);
    
    const message = wishlistItem.exists ? 'Product already in wishlist' : 'Product added to wishlist successfully';
    const statusCode = wishlistItem.exists ? 200 : 201;
    
    sendResponse(res, true, { wishlistItem }, message, statusCode);
  } catch (err) {
    next(err);
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    const removed = await Wishlist.removeItem(userId, productId);
    
    if (!removed) {
      return sendResponse(res, false, null, 'Product not found in wishlist', 404);
    }
    
    sendResponse(res, true, null, 'Product removed from wishlist successfully');
  } catch (err) {
    next(err);
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const removedCount = await Wishlist.clearWishlist(userId);
    
    sendResponse(res, true, { removedCount }, 'Wishlist cleared successfully');
  } catch (err) {
    next(err);
  }
};

// Move wishlist item to cart
exports.moveToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { variant_id } = req.body;
    
    if (!variant_id) {
      return sendResponse(res, false, null, 'Product variant ID is required', 400);
    }

    const moved = await Wishlist.moveToCart(userId, productId, variant_id);
    
    if (!moved) {
      return sendResponse(res, false, null, 'Product not found in wishlist or invalid variant', 404);
    }
    
    sendResponse(res, true, null, 'Product moved to cart successfully');
  } catch (err) {
    next(err);
  }
};

// Get wishlist item count
exports.getWishlistCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await Wishlist.getWishlistCount(userId);
    
    sendResponse(res, true, { count }, 'Wishlist count retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Get wishlist-based recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    const recommendations = await Wishlist.getRecommendations(userId, parseInt(limit));
    
    sendResponse(res, true, { recommendations }, 'Recommendations retrieved successfully');
  } catch (err) {
    next(err);
  }
};