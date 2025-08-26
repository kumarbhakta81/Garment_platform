import React, { useState, useEffect } from 'react';
import { getNotifications, getNotificationCounts, markAsRead, markAllAsRead, deleteNotification } from '../api/notificationApi';

const NotificationPanel = ({ userRole = 'admin' }) => {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    fetchCounts();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
      fetchCounts();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const filters = {};
      if (filter !== 'all') {
        if (filter === 'unread') {
          filters.is_read = 'false';
        } else {
          filters.type = filter;
        }
      }
      const data = await getNotifications(filters);
      setNotifications(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const data = await getNotificationCounts();
      setCounts(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.error('Error fetching notification counts:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      fetchCounts();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      fetchCounts();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
        fetchCounts();
      } catch (error) {
        // eslint-disable-next-line no-console
      console.error('Error deleting notification:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'product_upload': return '📦';
      case 'sample_upload': return '🎯';
      case 'order_placed': return '🛒';
      case 'order_updated': return '📋';
      case 'product_approved': return '✅';
      case 'product_rejected': return '❌';
      default: return '📢';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          Notifications 
          {counts.unread > 0 && (
            <span className="badge bg-danger ms-2">{counts.unread}</span>
          )}
        </h5>
        {counts.unread > 0 && (
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={handleMarkAllAsRead}
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="card-body p-0">
        {/* Filter Tabs */}
        <div className="d-flex border-bottom">
          <button 
            className={`btn btn-link text-decoration-none border-0 rounded-0 ${filter === 'all' ? 'border-bottom border-primary' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({counts.total || 0})
          </button>
          <button 
            className={`btn btn-link text-decoration-none border-0 rounded-0 ${filter === 'unread' ? 'border-bottom border-primary' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({counts.unread || 0})
          </button>
          {userRole === 'admin' && (
            <>
              <button 
                className={`btn btn-link text-decoration-none border-0 rounded-0 ${filter === 'product_upload' ? 'border-bottom border-primary' : ''}`}
                onClick={() => setFilter('product_upload')}
              >
                Products ({counts.product_uploads || 0})
              </button>
              <button 
                className={`btn btn-link text-decoration-none border-0 rounded-0 ${filter === 'order_placed' ? 'border-bottom border-primary' : ''}`}
                onClick={() => setFilter('order_placed')}
              >
                Orders ({counts.order_placed || 0})
              </button>
            </>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
          {loading ? (
            <div className="text-center p-3">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-3 text-muted">
              No notifications found
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`d-flex align-items-start p-3 border-bottom ${!notification.is_read ? 'bg-light' : ''}`}
              >
                <div className="me-2 fs-4">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1 fw-bold">{notification.title}</h6>
                    <small className="text-muted">{formatTime(notification.created_at)}</small>
                  </div>
                  <p className="mb-1 text-muted">{notification.message}</p>
                  <div className="d-flex gap-2">
                    {!notification.is_read && (
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark Read
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(notification.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;