const Wishlist = require('../models/Wishlist');
const { validationResult } = require('express-validator');

const wishlistController = {
  // Add garment to wishlist
  addToWishlist: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { garment_id } = req.body;
      const userId = req.user.id;

      const result = await Wishlist.addItem(userId, garment_id);
      
      res.status(201).json({
        message: 'Item added to wishlist successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // Remove garment from wishlist
  removeFromWishlist: async (req, res, next) => {
    try {
      const { garmentId } = req.params;
      const userId = req.user.id;

      if (!garmentId || isNaN(garmentId)) {
        return res.status(400).json({ 
          message: 'Invalid garment ID' 
        });
      }

      const success = await Wishlist.removeItem(userId, parseInt(garmentId));
      
      if (!success) {
        return res.status(404).json({ 
          message: 'Wishlist item not found' 
        });
      }

      res.json({
        message: 'Item removed from wishlist successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's wishlist
  getWishlist: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const items = await Wishlist.getWishlistItems(userId);
      const summary = await Wishlist.getWishlistSummary(userId);
      
      res.json({
        message: 'Wishlist retrieved successfully',
        data: {
          items,
          summary
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Clear entire wishlist
  clearWishlist: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const removedCount = await Wishlist.clearWishlist(userId);
      
      res.json({
        message: 'Wishlist cleared successfully',
        data: { removedItems: removedCount }
      });
    } catch (error) {
      next(error);
    }
  },

  // Move wishlist item to cart
  moveToCart: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { garment_id, variant_id, quantity = 1 } = req.body;
      const userId = req.user.id;

      await Wishlist.moveToCart(userId, garment_id, variant_id, quantity);
      
      res.json({
        message: 'Item moved to cart successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Check if item is in wishlist
  checkWishlistItem: async (req, res, next) => {
    try {
      const { garmentId } = req.params;
      const userId = req.user.id;

      if (!garmentId || isNaN(garmentId)) {
        return res.status(400).json({ 
          message: 'Invalid garment ID' 
        });
      }

      const isInWishlist = await Wishlist.isInWishlist(userId, parseInt(garmentId));
      
      res.json({
        message: 'Wishlist status retrieved successfully',
        data: { isInWishlist }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = wishlistController;