// Product model for modern e-commerce platform
// Using MySQL with standardized product structure

const pool = require('../config/db');

class Product {
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT p.*, 
               COUNT(pv.id) as variant_count,
               MIN(pv.price) as min_price,
               MAX(pv.price) as max_price
        FROM products p 
        LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
        WHERE p.is_active = true
      `;
      
      const params = [];
      
      if (filters.category) {
        query += ' AND p.category = ?';
        params.push(filters.category);
      }
      
      if (filters.brand) {
        query += ' AND p.brand = ?';
        params.push(filters.brand);
      }
      
      if (filters.gender) {
        query += ' AND p.gender = ?';
        params.push(filters.gender);
      }
      
      if (filters.search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ' GROUP BY p.id ORDER BY p.created_at DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }
      
      const [products] = await pool.query(query, params);
      return products;
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const [products] = await pool.query(`
        SELECT p.*,
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'id', pv.id,
                   'size', pv.size,
                   'color', pv.color,
                   'price', pv.price,
                   'stock_quantity', pv.stock_quantity,
                   'sku', pv.sku
                 )
               ) as variants
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = true
        WHERE p.id = ? AND p.is_active = true
        GROUP BY p.id
      `, [id]);
      
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  static async create(productData) {
    try {
      const { name, description, category, brand, material, season, gender, base_price, images, slug } = productData;
      
      const [result] = await pool.query(`
        INSERT INTO products (name, description, category, brand, material, season, gender, base_price, images, slug)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, description, category, brand, material, season, gender, base_price, JSON.stringify(images), slug]);
      
      return { id: result.insertId, ...productData };
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, productData) {
    try {
      const { name, description, category, brand, material, season, gender, base_price, images, slug, is_active } = productData;
      
      await pool.query(`
        UPDATE products 
        SET name = ?, description = ?, category = ?, brand = ?, material = ?, 
            season = ?, gender = ?, base_price = ?, images = ?, slug = ?, is_active = ?
        WHERE id = ?
      `, [name, description, category, brand, material, season, gender, base_price, 
          JSON.stringify(images), slug, is_active !== undefined ? is_active : true, id]);
      
      return { id, ...productData };
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      await pool.query('UPDATE products SET is_active = false WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async getCategories() {
    try {
      const [categories] = await pool.query(`
        SELECT category as name, COUNT(*) as product_count
        FROM products 
        WHERE is_active = true
        GROUP BY category
        ORDER BY category
      `);
      return categories;
    } catch (error) {
      throw error;
    }
  }
  
  static async getBrands() {
    try {
      const [brands] = await pool.query(`
        SELECT brand as name, COUNT(*) as product_count
        FROM products 
        WHERE is_active = true AND brand IS NOT NULL
        GROUP BY brand
        ORDER BY brand
      `);
      return brands;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
