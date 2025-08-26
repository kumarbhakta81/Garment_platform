const pool = require('../config/db');

// Get all orders with filtering
exports.getOrders = async (req, res, next) => {
  try {
    const { retailer_id, wholesaler_id, status, product_id } = req.query;
    const user = req.user;
    
    let query = `
      SELECT o.*, 
             p.name as product_name, p.price as product_price,
             retailer.username as retailer_name, retailer.email as retailer_email,
             wholesaler.username as wholesaler_name, wholesaler.email as wholesaler_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users retailer ON o.retailer_id = retailer.id
      JOIN users wholesaler ON o.wholesaler_id = wholesaler.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (user.role === 'retailer') {
      query += ' AND o.retailer_id = ?';
      params.push(user.id);
    } else if (user.role === 'wholesaler') {
      query += ' AND o.wholesaler_id = ?';
      params.push(user.id);
    }

    // Additional filters
    if (retailer_id && user.role === 'admin') {
      query += ' AND o.retailer_id = ?';
      params.push(retailer_id);
    }
    if (wholesaler_id && user.role === 'admin') {
      query += ' AND o.wholesaler_id = ?';
      params.push(wholesaler_id);
    }
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (product_id) {
      query += ' AND o.product_id = ?';
      params.push(product_id);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await pool.query(query, params);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Create an order (retailer action)
exports.createOrder = async (req, res, next) => {
  try {
    const { product_id, quantity, shipping_address, order_notes } = req.body;
    const retailer_id = req.user.id;

    if (req.user.role !== 'retailer') {
      return res.status(403).json({ message: 'Only retailers can place orders' });
    }

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }

    // Get product details
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND status = "approved"', 
      [product_id]
    );

    if (!product.length) {
      return res.status(404).json({ message: 'Product not found or not approved' });
    }

    if (product[0].quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient product quantity' });
    }

    const unitPrice = parseFloat(product[0].price);
    const totalPrice = unitPrice * quantity;

    const [result] = await pool.query(
      `INSERT INTO orders (retailer_id, wholesaler_id, product_id, quantity, unit_price, total_price, shipping_address, order_notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [retailer_id, product[0].wholesaler_id, product_id, quantity, unitPrice, totalPrice, shipping_address, order_notes]
    );

    // Update product quantity
    await pool.query(
      'UPDATE products SET quantity = quantity - ? WHERE id = ?',
      [quantity, product_id]
    );

    // Notify wholesaler and admin
    const orderNotificationMessage = `New order placed for product: ${product[0].name} (Quantity: ${quantity})`;
    
    // Notify wholesaler
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       VALUES (?, 'order_placed', 'New Order Received', ?, ?)`,
      [product[0].wholesaler_id, orderNotificationMessage, result.insertId]
    );

    // Notify admin
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       SELECT id, 'order_placed', 'New Order Placed', ?, ? 
       FROM users WHERE role = 'admin'`,
      [orderNotificationMessage, result.insertId]
    );

    res.status(201).json({
      id: result.insertId,
      retailer_id,
      wholesaler_id: product[0].wholesaler_id,
      product_id,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      shipping_address,
      order_notes,
      status: 'pending'
    });
  } catch (err) {
    next(err);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get order details
    const [order] = await pool.query(`
      SELECT o.*, p.name as product_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `, [id]);

    if (!order.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (user.role === 'retailer' && order[0].retailer_id !== user.id) {
      return res.status(403).json({ message: 'You can only update your own orders' });
    }
    if (user.role === 'wholesaler' && order[0].wholesaler_id !== user.id) {
      return res.status(403).json({ message: 'You can only update orders for your products' });
    }

    // Retailers can only cancel their own pending orders
    if (user.role === 'retailer' && (status !== 'cancelled' || order[0].status !== 'pending')) {
      return res.status(403).json({ message: 'Retailers can only cancel pending orders' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // Create notifications for status updates
    let notificationMessage = `Order #${id} for ${order[0].product_name} has been ${status}`;
    
    // Notify retailer if wholesaler/admin updated the order
    if (user.role !== 'retailer') {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id) 
         VALUES (?, 'order_updated', 'Order Status Updated', ?, ?)`,
        [order[0].retailer_id, notificationMessage, id]
      );
    }

    // Notify wholesaler if retailer cancelled
    if (user.role === 'retailer' && status === 'cancelled') {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id) 
         VALUES (?, 'order_updated', 'Order Cancelled', ?, ?)`,
        [order[0].wholesaler_id, notificationMessage, id]
      );

      // Restore product quantity if order was cancelled
      await pool.query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [order[0].quantity, order[0].product_id]
      );
    }

    res.json({ message: 'Order status updated successfully', id, status });
  } catch (err) {
    next(err);
  }
};

// Get order details
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [order] = await pool.query(`
      SELECT o.*, 
             p.name as product_name, p.description as product_description,
             retailer.username as retailer_name, retailer.email as retailer_email,
             wholesaler.username as wholesaler_name, wholesaler.email as wholesaler_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users retailer ON o.retailer_id = retailer.id
      JOIN users wholesaler ON o.wholesaler_id = wholesaler.id
      WHERE o.id = ?
    `, [id]);

    if (!order.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (user.role === 'retailer' && order[0].retailer_id !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (user.role === 'wholesaler' && order[0].wholesaler_id !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order[0]);
  } catch (err) {
    next(err);
  }
};

// Get order analytics
exports.getOrderAnalytics = async (req, res, next) => {
  try {
    const user = req.user;
    let query = '';
    let params = [];

    if (user.role === 'admin') {
      query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_price) as total_revenue,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
        FROM orders
      `;
    } else if (user.role === 'wholesaler') {
      query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_price) as total_revenue,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
        FROM orders
        WHERE wholesaler_id = ?
      `;
      params.push(user.id);
    } else {
      query = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_price) as total_spent,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
        FROM orders
        WHERE retailer_id = ?
      `;
      params.push(user.id);
    }

    const [analytics] = await pool.query(query, params);
    
    res.json(analytics[0] || {
      total_orders: 0,
      total_revenue: 0,
      total_spent: 0,
      pending_orders: 0,
      confirmed_orders: 0,
      processing_orders: 0,
      shipped_orders: 0,
      delivered_orders: 0,
      cancelled_orders: 0
    });
  } catch (err) {
    next(err);
  }
};