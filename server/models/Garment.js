const { pool } = require('../config/database');

class Garment {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM garments WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByIdWithVariants(id) {
    const garment = await this.findById(id);
    if (!garment) return null;
    
    const [variants] = await pool.query(`
      SELECT * FROM garment_variants 
      WHERE garment_id = ? 
      ORDER BY size, color
    `, [id]);
    
    return { ...garment, variants };
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM garments WHERE is_active = TRUE';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters.gender) {
      query += ' AND gender = ?';
      params.push(filters.gender);
    }

    if (filters.season) {
      query += ' AND season = ?';
      params.push(filters.season);
    }

    if (filters.minPrice) {
      query += ' AND base_price >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += ' AND base_price <= ?';
      params.push(filters.maxPrice);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async create(garmentData) {
    const {
      name, description, category, brand, material,
      season = 'all-season', gender, base_price, images
    } = garmentData;

    const [result] = await pool.query(`
      INSERT INTO garments (name, description, category, brand, material, season, gender, base_price, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, category, brand, material, season, gender, base_price, JSON.stringify(images)]);

    return { id: result.insertId, ...garmentData };
  }

  static async update(id, garmentData) {
    const {
      name, description, category, brand, material,
      season, gender, base_price, images, is_active
    } = garmentData;

    await pool.query(`
      UPDATE garments 
      SET name = ?, description = ?, category = ?, brand = ?, 
          material = ?, season = ?, gender = ?, base_price = ?, 
          images = ?, is_active = ?
      WHERE id = ?
    `, [name, description, category, brand, material, season, gender, base_price, 
        JSON.stringify(images), is_active, id]);

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('UPDATE garments SET is_active = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async search(searchTerm) {
    const [rows] = await pool.query(`
      SELECT * FROM garments 
      WHERE is_active = TRUE 
      AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)
      ORDER BY created_at DESC
    `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
    
    return rows;
  }
}

module.exports = Garment;