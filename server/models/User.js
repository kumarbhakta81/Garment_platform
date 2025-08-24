const { pool } = require('../config/database');

class User {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password, role = 'customer' } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    return { id: result.insertId, username, email, role };
  }

  static async update(id, userData) {
    const { username, email } = userData;
    await pool.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
    return rows;
  }
}

module.exports = User;