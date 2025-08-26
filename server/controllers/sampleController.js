const pool = require('../config/db');

// Get all samples with filtering
exports.getSamples = async (req, res, next) => {
  try {
    const { product_id, status } = req.query;
    let query = `
      SELECT s.*, p.name as product_name, u.username as wholesaler_name
      FROM samples s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON p.wholesaler_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += ' AND s.product_id = ?';
      params.push(product_id);
    }
    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.created_at DESC';

    const [samples] = await pool.query(query, params);
    res.json(samples);
  } catch (err) {
    next(err);
  }
};

// Create a sample
exports.createSample = async (req, res, next) => {
  try {
    const { product_id, title, description } = req.body;
    
    if (!product_id || !title) {
      return res.status(400).json({ message: 'Product ID and title are required' });
    }

    // Check if product exists and user owns it (for wholesalers)
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ?', [product_id]
    );

    if (!product.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If user is wholesaler, ensure they own the product
    if (req.user.role === 'wholesaler' && product[0].wholesaler_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only create samples for your own products' });
    }

    // Handle uploaded sample file
    let sampleFileUrl = null;
    if (req.file) {
      sampleFileUrl = `/uploads/samples/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO samples (product_id, title, description, sample_file_url, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [product_id, title, description, sampleFileUrl]
    );

    // Create notification for admin
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       SELECT id, 'sample_upload', 'New Sample Upload', ?, ? 
       FROM users WHERE role = 'admin'`,
      [`New sample uploaded for product: ${product[0].name}`, result.insertId]
    );

    res.status(201).json({
      id: result.insertId,
      product_id,
      title,
      description,
      sample_file_url: sampleFileUrl,
      status: 'pending'
    });
  } catch (err) {
    next(err);
  }
};

// Update sample
exports.updateSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check if sample exists and user has permission
    const [sample] = await pool.query(`
      SELECT s.*, p.wholesaler_id 
      FROM samples s
      JOIN products p ON s.product_id = p.id
      WHERE s.id = ?
    `, [id]);

    if (!sample.length) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    // Wholesalers can only edit their own samples
    if (req.user.role === 'wholesaler' && sample[0].wholesaler_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own samples' });
    }

    // Handle new uploaded file
    let sampleFileUrl = sample[0].sample_file_url;
    if (req.file) {
      sampleFileUrl = `/uploads/samples/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE samples SET title = ?, description = ?, sample_file_url = ? WHERE id = ?',
      [title, description, sampleFileUrl, id]
    );

    res.json({ id, title, description, sample_file_url: sampleFileUrl });
  } catch (err) {
    next(err);
  }
};

// Delete sample
exports.deleteSample = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if sample exists and user has permission
    const [sample] = await pool.query(`
      SELECT s.*, p.wholesaler_id 
      FROM samples s
      JOIN products p ON s.product_id = p.id
      WHERE s.id = ?
    `, [id]);

    if (!sample.length) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    // Wholesalers can only delete their own samples
    if (req.user.role === 'wholesaler' && sample[0].wholesaler_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own samples' });
    }

    await pool.query('DELETE FROM samples WHERE id = ?', [id]);
    res.json({ message: 'Sample deleted successfully', id });
  } catch (err) {
    next(err);
  }
};

// Update sample status (admin only)
exports.updateSampleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve/reject samples' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    // Get sample details for notification
    const [sample] = await pool.query(`
      SELECT s.*, p.name as product_name, p.wholesaler_id
      FROM samples s
      JOIN products p ON s.product_id = p.id
      WHERE s.id = ?
    `, [id]);

    if (!sample.length) {
      return res.status(404).json({ message: 'Sample not found' });
    }

    await pool.query('UPDATE samples SET status = ? WHERE id = ?', [status, id]);

    // Notify wholesaler
    const notificationTitle = status === 'approved' ? 'Sample Approved' : 'Sample Rejected';
    const notificationMessage = `Your sample "${sample[0].title}" for product "${sample[0].product_name}" has been ${status}`;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [sample[0].wholesaler_id, `sample_${status}`, notificationTitle, notificationMessage, id]
    );

    res.json({ message: `Sample ${status} successfully`, id, status });
  } catch (err) {
    next(err);
  }
};