// Cart model for shopping cart functionality
const pool = require('../config/db');

class Cart {
  static async findByUserId(userId) {
    try {
      const [cartItems] = await pool.query(`
        SELECT c.id, c.quantity, c.added_at, c.updated_at,
               pv.id as variant_id, pv.size, pv.color, pv.price, pv.sku, pv.stock_quantity,
               p.id as product_id, p.name as product_name, p.description, p.brand, p.images
        FROM cart c
        JOIN product_variants pv ON c.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE c.user_id = ? AND pv.is_active = true AND p.is_active = true
        ORDER BY c.added_at DESC
      `, [userId]);
      
      return cartItems;
    } catch (error) {
      throw error;
    }
  }
  
  static async addItem(userId, variantId, quantity = 1) {
    try {
      // Check if item already exists in cart
      const [existing] = await pool.query(`
        SELECT id, quantity FROM cart WHERE user_id = ? AND variant_id = ?
      `, [userId, variantId]);
      
      if (existing.length > 0) {
        // Update existing item
        const newQuantity = existing[0].quantity + quantity;
        await pool.query(`
          UPDATE cart SET quantity = ? WHERE id = ?
        `, [newQuantity, existing[0].id]);
        
        return { id: existing[0].id, user_id: userId, variant_id: variantId, quantity: newQuantity };
      } else {
        // Add new item
        const [result] = await pool.query(`
          INSERT INTO cart (user_id, variant_id, quantity) VALUES (?, ?, ?)
        `, [userId, variantId, quantity]);
        
        return { id: result.insertId, user_id: userId, variant_id: variantId, quantity };
      }
    } catch (error) {
      throw error;
    }
  }
  
  static async updateItemQuantity(cartItemId, userId, quantity) {
    try {
      const [result] = await pool.query(`
        UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?
      `, [quantity, cartItemId, userId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async removeItem(cartItemId, userId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM cart WHERE id = ? AND user_id = ?
      `, [cartItemId, userId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async clearCart(userId) {
    try {
      const [result] = await pool.query(`
        DELETE FROM cart WHERE user_id = ?
      `, [userId]);
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
  
  static async getCartSummary(userId) {
    try {
      const [summary] = await pool.query(`
        SELECT 
          COUNT(c.id) as total_items,
          SUM(c.quantity) as total_quantity,
          SUM(c.quantity * pv.price) as total_amount
        FROM cart c
        JOIN product_variants pv ON c.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE c.user_id = ? AND pv.is_active = true AND p.is_active = true
      `, [userId]);
      
      return summary[0] || { total_items: 0, total_quantity: 0, total_amount: 0 };
    } catch (error) {
      throw error;
    }
  }
  
  static async moveToWishlist(cartItemId, userId) {
    try {
      // Get cart item details
      const [cartItem] = await pool.query(`
        SELECT c.variant_id, pv.product_id
        FROM cart c
        JOIN product_variants pv ON c.variant_id = pv.id
        WHERE c.id = ? AND c.user_id = ?
      `, [cartItemId, userId]);
      
      if (cartItem.length === 0) {
        return false;
      }
      
      const productId = cartItem[0].product_id;
      
      // Add to wishlist (ignore if already exists)
      await pool.query(`
        INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)
      `, [userId, productId]);
      
      // Remove from cart
      await this.removeItem(cartItemId, userId);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async validateCartItems(userId) {
    try {
      // Check for items that are no longer available or out of stock
      const [invalidItems] = await pool.query(`
        SELECT c.id, c.quantity, pv.stock_quantity, p.name as product_name, pv.size, pv.color
        FROM cart c
        JOIN product_variants pv ON c.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE c.user_id = ? AND (
          pv.is_active = false OR 
          p.is_active = false OR 
          pv.stock_quantity < c.quantity
        )
      `, [userId]);
      
      return invalidItems;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cart;