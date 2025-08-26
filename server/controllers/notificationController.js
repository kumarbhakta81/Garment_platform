const pool = require('../config/db');

// Get notifications for current user
exports.getNotifications = async (req, res, next) => {
  try {
    const { is_read, type, limit = 50, offset = 0 } = req.query;
    const user_id = req.user.id;

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [user_id];

    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true');
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [notifications] = await pool.query(query, params);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verify notification belongs to user
    const [notification] = await pool.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (!notification.length) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    res.json({ message: 'Notification marked as read', id });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verify notification belongs to user
    const [notification] = await pool.query(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (!notification.length) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ message: 'Notification deleted', id });
  } catch (err) {
    next(err);
  }
};

// Get notification counts
exports.getNotificationCounts = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN type = 'product_upload' THEN 1 ELSE 0 END) as product_uploads,
        SUM(CASE WHEN type = 'sample_upload' THEN 1 ELSE 0 END) as sample_uploads,
        SUM(CASE WHEN type = 'order_placed' THEN 1 ELSE 0 END) as order_placed,
        SUM(CASE WHEN type = 'order_updated' THEN 1 ELSE 0 END) as order_updated,
        SUM(CASE WHEN type = 'product_approved' THEN 1 ELSE 0 END) as product_approved,
        SUM(CASE WHEN type = 'product_rejected' THEN 1 ELSE 0 END) as product_rejected
      FROM notifications 
      WHERE user_id = ?
    `, [user_id]);

    res.json(counts[0] || {
      total: 0,
      unread: 0,
      product_uploads: 0,
      sample_uploads: 0,
      order_placed: 0,
      order_updated: 0,
      product_approved: 0,
      product_rejected: 0
    });
  } catch (err) {
    next(err);
  }
};

// Create notification (internal function for other controllers)
exports.createNotification = async (user_id, type, title, message, related_id = null) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, type, title, message, related_id]
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error creating notification:', err);
  }
};

// Admin function to get all notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { type, is_read, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT n.*, u.username, u.email, u.role
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }

    if (is_read !== undefined) {
      query += ' AND n.is_read = ?';
      params.push(is_read === 'true');
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [notifications] = await pool.query(query, params);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};