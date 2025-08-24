const Cart = require('../models/Cart');
const ProductVariant = require('../models/ProductVariant');

// Standardized response helper
const sendResponse = (res, success, data = null, message = '', statusCode = 200) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

// Get user's cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.findByUserId(userId);
    
    sendResponse(res, true, { cart: cartItems }, 'Cart retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Add product variant to cart
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { variant_id, quantity = 1 } = req.body;
    
    if (!variant_id) {
      return sendResponse(res, false, null, 'Product variant ID is required', 400);
    }

    if (quantity < 1 || quantity > 10) {
      return sendResponse(res, false, null, 'Quantity must be between 1 and 10', 400);
    }

    // Verify variant exists and has stock
    const variant = await ProductVariant.findById(variant_id);
    if (!variant) {
      return sendResponse(res, false, null, 'Product variant not found', 404);
    }

    const hasStock = await ProductVariant.checkStock(variant_id, quantity);
    if (!hasStock) {
      return sendResponse(res, false, null, 'Insufficient stock for this product variant', 400);
    }

    const cartItem = await Cart.addItem(userId, variant_id, quantity);
    
    sendResponse(res, true, { cartItem }, 'Product added to cart successfully', 201);
  } catch (err) {
    next(err);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1 || quantity > 10) {
      return sendResponse(res, false, null, 'Quantity must be between 1 and 10', 400);
    }

    const updated = await Cart.updateItemQuantity(itemId, userId, quantity);
    
    if (!updated) {
      return sendResponse(res, false, null, 'Cart item not found', 404);
    }
    
    sendResponse(res, true, null, 'Cart item updated successfully');
  } catch (err) {
    next(err);
  }
};

// **KEY CHALLENGE SOLUTION**: Remove specific cart item
exports.removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    
    if (!itemId) {
      return sendResponse(res, false, null, 'Cart item ID is required', 400);
    }
    
    const removed = await Cart.removeItem(itemId, userId);
    
    if (!removed) {
      return sendResponse(res, false, null, 'Cart item not found', 404);
    }
    
    sendResponse(res, true, null, 'Item removed from cart successfully');
  } catch (error) {
    sendResponse(res, false, null, 'Error removing item from cart', 500);
  }
};

// Clear entire cart
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const removedCount = await Cart.clearCart(userId);
    
    sendResponse(res, true, { removedCount }, 'Cart cleared successfully');
  } catch (err) {
    next(err);
  }
};

// Get cart summary (totals)
exports.getCartSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const summary = await Cart.getCartSummary(userId);
    
    sendResponse(res, true, { summary }, 'Cart summary retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Move cart item to wishlist
exports.moveToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const moved = await Cart.moveToWishlist(itemId, userId);
    
    if (!moved) {
      return sendResponse(res, false, null, 'Cart item not found', 404);
    }
    
    sendResponse(res, true, null, 'Item moved to wishlist successfully');
  } catch (err) {
    next(err);
  }
};

// Validate cart items (check stock, availability)
exports.validateCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const invalidItems = await Cart.validateCartItems(userId);
    
    const isValid = invalidItems.length === 0;
    const data = { isValid, invalidItems };
    
    sendResponse(res, true, data, isValid ? 'Cart is valid' : 'Some cart items need attention');
  } catch (err) {
    next(err);
  }
};