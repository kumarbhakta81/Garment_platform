const express = require('express');
const router = express.Router();
const {
  getOrders,
  createOrder,
  updateOrderStatus,
  getOrderById,
  getOrderAnalytics
} = require('../controllers/orderController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.get('/', authenticateJWT, getOrders); // List orders with filtering
router.post('/', authenticateJWT, createOrder); // Create order (retailer)
router.get('/analytics', authenticateJWT, getOrderAnalytics); // Get order analytics
router.get('/:id', authenticateJWT, getOrderById); // Get order details
router.patch('/:id/status', authenticateJWT, updateOrderStatus); // Update order status

module.exports = router;