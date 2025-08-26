const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationCounts,
  getAllNotifications
} = require('../controllers/notificationController');
const authenticateJWT = require('../middlewares/authenticateJWT');

router.get('/', authenticateJWT, getNotifications); // Get user notifications
router.get('/counts', authenticateJWT, getNotificationCounts); // Get notification counts
router.get('/all', authenticateJWT, getAllNotifications); // Get all notifications (admin)
router.patch('/:id/read', authenticateJWT, markAsRead); // Mark notification as read
router.patch('/mark-all-read', authenticateJWT, markAllAsRead); // Mark all as read
router.delete('/:id', authenticateJWT, deleteNotification); // Delete notification

module.exports = router;