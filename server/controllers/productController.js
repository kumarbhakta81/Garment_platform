const pool = require('../config/db');

// List all products with filtering
exports.getProducts = async (req, res, next) => {
  try {
    const { wholesaler_id, status, category_id, search } = req.query;
    let query = `
      SELECT p.*, u.username as wholesaler_name, c.name as category_name 
      FROM products p 
      LEFT JOIN users u ON p.wholesaler_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (wholesaler_id) {
      query += ' AND p.wholesaler_id = ?';
      params.push(wholesaler_id);
    }
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (category_id) {
      query += ' AND p.category_id = ?';
      params.push(category_id);
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await pool.query(query, params);
    
    // Parse images JSON for each product
    const productsWithImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json(productsWithImages);
  } catch (err) {
    next(err);
  }
};

// Create a product (enhanced for wholesalers)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, description, quantity, category_id } = req.body;
    const wholesaler_id = req.user.id;
    
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Handle uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, price, description, quantity, category_id, wholesaler_id, images, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name, price, description, quantity || 0, category_id || null, wholesaler_id, JSON.stringify(imageUrls)]
    );

    // Create notification for admin
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       SELECT id, 'product_upload', 'New Product Upload', ?, ? 
       FROM users WHERE role = 'admin'`,
      [`Wholesaler uploaded new product: ${name}`, result.insertId]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      price, 
      description, 
      quantity: quantity || 0,
      category_id,
      wholesaler_id,
      images: imageUrls,
      status: 'pending'
    });
  } catch (err) {
    next(err);
  }
};

// Edit a product (enhanced)
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, quantity, category_id } = req.body;
    const { id } = req.params;
    const user = req.user;
    
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Check if user can edit this product
    const [existingProduct] = await pool.query(
      'SELECT * FROM products WHERE id = ?', [id]
    );
    
    if (!existingProduct.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Wholesalers can only edit their own products, admins can edit any
    if (user.role === 'wholesaler' && existingProduct[0].wholesaler_id !== user.id) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    // Handle new uploaded images
    let imageUrls = existingProduct[0].images ? JSON.parse(existingProduct[0].images) : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      imageUrls = [...imageUrls, ...newImages];
    }

    await pool.query(
      `UPDATE products SET name = ?, price = ?, description = ?, quantity = ?, category_id = ?, images = ?
       WHERE id = ?`,
      [name, price, description, quantity || 0, category_id || null, JSON.stringify(imageUrls), id]
    );

    res.json({ id, name, price, description, quantity: quantity || 0, category_id, images: imageUrls });
  } catch (err) {
    next(err);
  }
};

// Delete a product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if product exists and user has permission
    const [existingProduct] = await pool.query(
      'SELECT * FROM products WHERE id = ?', [id]
    );
    
    if (!existingProduct.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Wholesalers can only delete their own products, admins can delete any
    if (user.role === 'wholesaler' && existingProduct[0].wholesaler_id !== user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully', id });
  } catch (err) {
    next(err);
  }
};

// Approve/reject product (admin only)
exports.updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve/reject products' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    // Get product details for notification
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ?', [id]
    );
    
    if (!product.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);

    // Notify wholesaler
    const notificationType = status === 'approved' ? 'product_approved' : 'product_rejected';
    const notificationTitle = status === 'approved' ? 'Product Approved' : 'Product Rejected';
    const notificationMessage = `Your product "${product[0].name}" has been ${status}`;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [product[0].wholesaler_id, notificationType, notificationTitle, notificationMessage, id]
    );

    res.json({ message: `Product ${status} successfully`, id, status });
  } catch (err) {
    next(err);
  }
};

// Get analytics for wholesaler
exports.getProductAnalytics = async (req, res, next) => {
  try {
    const wholesaler_id = req.user.id;

    const [analytics] = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_products,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_products,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_products,
        SUM(quantity) as total_quantity,
        AVG(price) as average_price
      FROM products 
      WHERE wholesaler_id = ?
    `, [wholesaler_id]);

    res.json(analytics[0] || {
      total_products: 0,
      approved_products: 0,
      pending_products: 0,
      rejected_products: 0,
      total_quantity: 0,
      average_price: 0
    });
  } catch (err) {
    next(err);
  }
};
