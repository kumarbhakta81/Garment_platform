// ProductVariant model for managing product sizes, colors, and stock
const pool = require('../config/db');

class ProductVariant {
  static async findByProductId(productId) {
    try {
      const [variants] = await pool.query(`
        SELECT pv.*, p.name as product_name, p.base_price
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        WHERE pv.product_id = ? AND pv.is_active = true
        ORDER BY pv.size, pv.color
      `, [productId]);
      
      return variants;
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const [variants] = await pool.query(`
        SELECT pv.*, p.name as product_name, p.base_price
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        WHERE pv.id = ? AND pv.is_active = true
      `, [id]);
      
      return variants.length > 0 ? variants[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  static async create(variantData) {
    try {
      const { product_id, size, color, stock_quantity, price, sku } = variantData;
      
      const [result] = await pool.query(`
        INSERT INTO product_variants (product_id, size, color, stock_quantity, price, sku)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [product_id, size, color, stock_quantity, price, sku]);
      
      return { id: result.insertId, ...variantData };
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, variantData) {
    try {
      const { size, color, stock_quantity, price, sku, is_active } = variantData;
      
      await pool.query(`
        UPDATE product_variants 
        SET size = ?, color = ?, stock_quantity = ?, price = ?, sku = ?, is_active = ?
        WHERE id = ?
      `, [size, color, stock_quantity, price, sku, is_active !== undefined ? is_active : true, id]);
      
      return { id, ...variantData };
    } catch (error) {
      throw error;
    }
  }
  
  static async updateStock(id, newStock) {
    try {
      await pool.query(`
        UPDATE product_variants 
        SET stock_quantity = ?
        WHERE id = ?
      `, [newStock, id]);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async checkStock(id, quantity = 1) {
    try {
      const [variants] = await pool.query(`
        SELECT stock_quantity
        FROM product_variants
        WHERE id = ? AND is_active = true
      `, [id]);
      
      if (variants.length === 0) return false;
      return variants[0].stock_quantity >= quantity;
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      await pool.query('UPDATE product_variants SET is_active = false WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async getAvailableSizes(productId) {
    try {
      const [sizes] = await pool.query(`
        SELECT DISTINCT size
        FROM product_variants
        WHERE product_id = ? AND is_active = true AND stock_quantity > 0
        ORDER BY FIELD(size, 'XS', 'S', 'M', 'L', 'XL', 'XXL')
      `, [productId]);
      
      return sizes.map(s => s.size);
    } catch (error) {
      throw error;
    }
  }
  
  static async getAvailableColors(productId, size = null) {
    try {
      let query = `
        SELECT DISTINCT color
        FROM product_variants
        WHERE product_id = ? AND is_active = true AND stock_quantity > 0
      `;
      const params = [productId];
      
      if (size) {
        query += ' AND size = ?';
        params.push(size);
      }
      
      query += ' ORDER BY color';
      
      const [colors] = await pool.query(query, params);
      return colors.map(c => c.color);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductVariant;