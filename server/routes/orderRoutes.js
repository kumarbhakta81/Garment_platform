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
const { orderValidationRules, statusValidationRules, handleValidationErrors } = require('../middlewares/validation');
const { orderLimiter } = require('../middlewares/rateLimiting');

router.get('/', authenticateJWT, getOrders); // List orders with filtering
router.post('/', authenticateJWT, orderLimiter, orderValidationRules(), handleValidationErrors, createOrder); // Create order (retailer)
router.get('/analytics', authenticateJWT, getOrderAnalytics); // Get order analytics
router.get('/:id', authenticateJWT, getOrderById); // Get order details
router.patch('/:id/status', authenticateJWT, statusValidationRules(), handleValidationErrors, updateOrderStatus); // Update order status

module.exports = router;