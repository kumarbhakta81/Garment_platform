const { pool } = require('../config/database');

class Wishlist {
  static async addItem(userId, garmentId) {
    // Check if garment exists
    const [garmentRows] = await pool.query(
      'SELECT * FROM garments WHERE id = ? AND is_active = TRUE',
      [garmentId]
    );

    if (garmentRows.length === 0) {
      throw new Error('Garment not found or inactive');
    }

    // Check if item already exists in wishlist
    const [existing] = await pool.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND garment_id = ?',
      [userId, garmentId]
    );

    if (existing.length > 0) {
      throw new Error('Item already in wishlist');
    }

    // Add to wishlist
    const [result] = await pool.query(
      'INSERT INTO wishlist (user_id, garment_id) VALUES (?, ?)',
      [userId, garmentId]
    );

    return { id: result.insertId, garment_id: garmentId };
  }

  static async removeItem(userId, garmentId) {
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND garment_id = ?',
      [userId, garmentId]
    );
    return result.affectedRows > 0;
  }

  static async clearWishlist(userId) {
    const [result] = await pool.query('DELETE FROM wishlist WHERE user_id = ?', [userId]);
    return result.affectedRows;
  }

  static async getWishlistItems(userId) {
    const [rows] = await pool.query(`
      SELECT 
        w.id,
        w.added_at,
        g.id as garment_id,
        g.name,
        g.description,
        g.category,
        g.brand,
        g.material,
        g.season,
        g.gender,
        g.base_price,
        g.images,
        -- Get available variants for this garment
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', gv.id,
            'size', gv.size,
            'color', gv.color,
            'price', gv.price,
            'stock_quantity', gv.stock_quantity,
            'sku', gv.sku
          )
        ) FROM garment_variants gv WHERE gv.garment_id = g.id) as variants
      FROM wishlist w
      JOIN garments g ON w.garment_id = g.id
      WHERE w.user_id = ? AND g.is_active = TRUE
      ORDER BY w.added_at DESC
    `, [userId]);

    return rows.map(row => ({
      ...row,
      variants: row.variants ? JSON.parse(row.variants) : []
    }));
  }

  static async getWishlistSummary(userId) {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_items
      FROM wishlist w
      JOIN garments g ON w.garment_id = g.id
      WHERE w.user_id = ? AND g.is_active = TRUE
    `, [userId]);

    return rows[0] || { total_items: 0 };
  }

  static async moveToCart(userId, garmentId, variantId, quantity = 1) {
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if item is in wishlist
      const [wishlistRows] = await connection.query(
        'SELECT * FROM wishlist WHERE user_id = ? AND garment_id = ?',
        [userId, garmentId]
      );

      if (wishlistRows.length === 0) {
        throw new Error('Item not found in wishlist');
      }

      // Check if variant exists and belongs to the garment
      const [variantRows] = await connection.query(
        'SELECT * FROM garment_variants WHERE id = ? AND garment_id = ?',
        [variantId, garmentId]
      );

      if (variantRows.length === 0) {
        throw new Error('Invalid variant for this garment');
      }

      const variant = variantRows[0];
      if (variant.stock_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // Check if item already exists in cart
      const [cartRows] = await connection.query(
        'SELECT * FROM cart WHERE user_id = ? AND variant_id = ?',
        [userId, variantId]
      );

      if (cartRows.length > 0) {
        // Update quantity in cart
        const newQuantity = cartRows[0].quantity + quantity;
        if (variant.stock_quantity < newQuantity) {
          throw new Error('Insufficient stock for requested quantity');
        }

        await connection.query(
          'UPDATE cart SET quantity = ? WHERE user_id = ? AND variant_id = ?',
          [newQuantity, userId, variantId]
        );
      } else {
        // Add new item to cart
        await connection.query(
          'INSERT INTO cart (user_id, variant_id, quantity) VALUES (?, ?, ?)',
          [userId, variantId, quantity]
        );
      }

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

  static async isInWishlist(userId, garmentId) {
    const [rows] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND garment_id = ?',
      [userId, garmentId]
    );
    return rows.length > 0;
  }
}

module.exports = Wishlist;