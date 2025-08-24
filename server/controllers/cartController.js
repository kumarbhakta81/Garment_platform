const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');

const cartController = {
  // Add item to cart
  addToCart: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { variant_id, quantity = 1 } = req.body;
      const userId = req.user.id;

      const result = await Cart.addItem(userId, variant_id, quantity);
      
      res.status(201).json({
        message: 'Item added to cart successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // Update cart item quantity
  updateCartItem: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { variant_id, quantity } = req.body;
      const userId = req.user.id;

      const result = await Cart.updateQuantity(userId, variant_id, quantity);
      
      res.json({
        message: 'Cart item updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's cart
  getCart: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const items = await Cart.getCartItems(userId);
      const summary = await Cart.getCartSummary(userId);
      
      res.json({
        message: 'Cart retrieved successfully',
        data: {
          items,
          summary
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Remove specific cart item (Challenge Solution)
  removeCartItem: async (req, res, next) => {
    try {
      const { variantId } = req.params;
      const userId = req.user.id;

      if (!variantId || isNaN(variantId)) {
        return res.status(400).json({ 
          message: 'Invalid variant ID' 
        });
      }

      const success = await Cart.removeItem(userId, parseInt(variantId));
      
      if (!success) {
        return res.status(404).json({ 
          message: 'Cart item not found' 
        });
      }

      res.json({
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Clear entire cart
  clearCart: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const removedCount = await Cart.clearCart(userId);
      
      res.json({
        message: 'Cart cleared successfully',
        data: { removedItems: removedCount }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get cart summary and totals
  getCartTotal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const summary = await Cart.getCartSummary(userId);
      
      res.json({
        message: 'Cart summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = cartController;