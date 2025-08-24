const pool = require('../config/db');

// List all products
exports.getProducts = async (req, res, next) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Create a product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
    const [result] = await pool.query('INSERT INTO products (name, price, description) VALUES (?, ?, ?)', [name, price, description]);
    res.status(201).json({ id: result.insertId, name, price, description });
  } catch (err) {
    next(err);
  }
};

// Edit a product
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, price, description } = req.body;
    const { id } = req.params;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
    await pool.query('UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?', [name, price, description, id]);
    res.json({ id, name, price, description });
  } catch (err) {
    next(err);
  }
};
