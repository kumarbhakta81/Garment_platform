// Wishlist model for user wishlists
const pool = require('../config/db');

class Wishlist {
  static async findByUserId(userId) {
    try {
      const [wishlistItems] = await pool.query(`
        SELECT w.id, w.added_at,
               p.id as product_id, p.name, p.description, p.brand, p.base_price, 
               p.images, p.category, p.gender,
               MIN(pv.price) as min_price,
               MAX(pv.price) as max_price,
               COUNT(pv.id) as variant_count
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
        WHERE w.user_id = ? AND p.is_active = true
        GROUP BY w.id, p.id
        ORDER BY w.added_at DESC
      `, [userId]);
      
      return wishlistItems;
    } catch (error) {
      throw error;
    }
  }
  
  static async addItem(userId, productId) {
    try {
      // Check if item already exists
      const [existing] = await pool.query(`
        SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?
      `, [userId, productId]);
      
      if (existing.length > 0) {
        return { id: existing[0].id, user_id: userId, product_id: productId, exists: true };
      }
      
      const [result] = await pool.query(`
        INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)
      `, [userId, productId]);
      
      return { id: result.insertId, user_id: userId, product_id: productId, exists: false };
    } catch (error) {
      throw error;
    }
  }
  
  static async removeItem(userId, productId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM wishlist WHERE user_id = ? AND product_id = ?
      `, [userId, productId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async clearWishlist(userId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM wishlist WHERE user_id = ?
      `, [userId]);
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
  
  static async getWishlistCount(userId) {
    try {
      const [count] = await pool.query(`
        SELECT COUNT(*) as count
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ? AND p.is_active = true
      `, [userId]);
      
      return count[0].count;
    } catch (error) {
      throw error;
    }
  }
  
  static async moveToCart(userId, productId, variantId) {
    try {
      // Verify the variant belongs to the product in wishlist
      const [wishlistItem] = await pool.query(`
        SELECT w.id
        FROM wishlist w
        JOIN product_variants pv ON w.product_id = pv.product_id
        WHERE w.user_id = ? AND w.product_id = ? AND pv.id = ?
      `, [userId, productId, variantId]);
      
      if (wishlistItem.length === 0) {
        return false;
      }
      
      // Add to cart
      const Cart = require('./Cart');
      await Cart.addItem(userId, variantId, 1);
      
      // Remove from wishlist
      await this.removeItem(userId, productId);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async isInWishlist(userId, productId) {
    try {
      const [existing] = await pool.query(`
        SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?
      `, [userId, productId]);
      
      return existing.length > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async getRecommendations(userId, limit = 10) {
    try {
      // Get product recommendations based on wishlist categories and brands
      const [recommendations] = await pool.query(`
        SELECT DISTINCT p.id, p.name, p.description, p.brand, p.base_price, 
               p.images, p.category, p.gender,
               MIN(pv.price) as min_price,
               MAX(pv.price) as max_price
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
        WHERE p.is_active = true 
        AND p.id NOT IN (SELECT product_id FROM wishlist WHERE user_id = ?)
        AND (
          p.category IN (
            SELECT DISTINCT p2.category 
            FROM wishlist w2 
            JOIN products p2 ON w2.product_id = p2.id 
            WHERE w2.user_id = ?
          )
          OR p.brand IN (
            SELECT DISTINCT p2.brand 
            FROM wishlist w2 
            JOIN products p2 ON w2.product_id = p2.id 
            WHERE w2.user_id = ? AND p2.brand IS NOT NULL
          )
        )
        GROUP BY p.id
        ORDER BY RAND()
        LIMIT ?
      `, [userId, userId, userId, limit]);
      
      return recommendations;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Wishlist;