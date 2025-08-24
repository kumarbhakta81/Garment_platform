const { pool } = require('../config/database');

class Cart {
  static async addItem(userId, variantId, quantity = 1) {
    // Check if variant exists and has stock
    const [variantRows] = await pool.query(`
      SELECT gv.*, g.name as garment_name 
      FROM garment_variants gv 
      JOIN garments g ON gv.garment_id = g.id 
      WHERE gv.id = ?
    `, [variantId]);

    const variant = variantRows[0];
    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists in cart
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND variant_id = ?',
      [userId, variantId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      if (variant.stock_quantity < newQuantity) {
        throw new Error('Insufficient stock for requested quantity');
      }

      await pool.query(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND variant_id = ?',
        [newQuantity, userId, variantId]
      );
      return { id: existing[0].id, quantity: newQuantity };
    } else {
      // Add new item
      const [result] = await pool.query(
        'INSERT INTO cart (user_id, variant_id, quantity) VALUES (?, ?, ?)',
        [userId, variantId, quantity]
      );
      return { id: result.insertId, quantity };
    }
  }

  static async updateQuantity(userId, variantId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(userId, variantId);
    }

    // Check stock availability
    const [variantRows] = await pool.query(
      'SELECT stock_quantity FROM garment_variants WHERE id = ?',
      [variantId]
    );

    const variant = variantRows[0];
    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND variant_id = ?',
      [quantity, userId, variantId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Cart item not found');
    }

    return { quantity };
  }

  static async removeItem(userId, variantId) {
    const [result] = await pool.query(
      'DELETE FROM cart WHERE user_id = ? AND variant_id = ?',
      [userId, variantId]
    );
    return result.affectedRows > 0;
  }

  static async clearCart(userId) {
    const [result] = await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
    return result.affectedRows;
  }

  static async getCartItems(userId) {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.quantity,
        c.added_at,
        gv.id as variant_id,
        gv.size,
        gv.color,
        gv.price,
        gv.stock_quantity,
        gv.sku,
        g.id as garment_id,
        g.name,
        g.description,
        g.category,
        g.brand,
        g.images,
        (gv.price * c.quantity) as item_total
      FROM cart c
      JOIN garment_variants gv ON c.variant_id = gv.id
      JOIN garments g ON gv.garment_id = g.id
      WHERE c.user_id = ?
      ORDER BY c.added_at DESC
    `, [userId]);

    return rows;
  }

  static async getCartSummary(userId) {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(c.quantity) as total_quantity,
        SUM(gv.price * c.quantity) as total_amount
      FROM cart c
      JOIN garment_variants gv ON c.variant_id = gv.id
      WHERE c.user_id = ?
    `, [userId]);

    return rows[0] || { total_items: 0, total_quantity: 0, total_amount: 0 };
  }

  static async moveFromWishlist(userId, garmentId, variantId, quantity = 1) {
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Add to cart
      await this.addItem(userId, variantId, quantity);
      
      // Remove from wishlist
      await connection.query(
        'DELETE FROM wishlist WHERE user_id = ? AND garment_id = ?',
        [userId, garmentId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Cart;