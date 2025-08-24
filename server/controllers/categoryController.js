const pool = require('../config/db');

// List all categories
exports.getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Create a category
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    next(err);
  }
};

// Edit a category
exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
  } catch (err) {
    next(err);
  }
};
