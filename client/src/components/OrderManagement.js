import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getOrderAnalytics } from '../api/orderApi';

const OrderManagement = ({ userRole = 'admin' }) => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusUpdate, setStatusUpdate] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }
      const data = await getOrders(filters);
      setOrders(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await getOrderAnalytics();
      setAnalytics(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching analytics:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      fetchAnalytics();
      setStatusUpdate({});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'processing': return 'bg-primary';
      case 'shipped': return 'bg-success';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getAvailableStatuses = (currentStatus, userRole) => {
    // Retailers can only cancel pending orders
    if (userRole === 'retailer') {
      return currentStatus === 'pending' ? ['cancelled'] : [];
    }
    
    // Wholesalers and admins can update to next logical statuses
    switch (currentStatus) {
      case 'pending': return ['confirmed', 'cancelled'];
      case 'confirmed': return ['processing', 'cancelled'];
      case 'processing': return ['shipped', 'cancelled'];
      case 'shipped': return ['delivered'];
      default: return [];
    }
  };

  return (
    <div>
      {/* Analytics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <h2 className="text-primary">{analytics.total_orders || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">
                {userRole === 'retailer' ? 'Total Spent' : 'Total Revenue'}
              </h5>
              <h2 className="text-success">
                ${(analytics.total_revenue || analytics.total_spent || 0).toFixed(2)}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <h2 className="text-warning">{analytics.pending_orders || 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Delivered</h5>
              <h2 className="text-success">{analytics.delivered_orders || 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Order Management</h5>
          
          {/* Status Filter */}
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{width: 'auto'}}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-4 text-muted">
              No orders found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    {userRole === 'admin' && <th>Retailer</th>}
                    {(userRole === 'admin' || userRole === 'retailer') && <th>Wholesaler</th>}
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>
                        <div>
                          <strong>{order.product_name}</strong>
                          <br />
                          <small className="text-muted">${order.unit_price}</small>
                        </div>
                      </td>
                      {userRole === 'admin' && (
                        <td>
                          <div>
                            <strong>{order.retailer_name}</strong>
                            <br />
                            <small className="text-muted">{order.retailer_email}</small>
                          </div>
                        </td>
                      )}
                      {(userRole === 'admin' || userRole === 'retailer') && (
                        <td>
                          <div>
                            <strong>{order.wholesaler_name}</strong>
                            <br />
                            <small className="text-muted">{order.wholesaler_email}</small>
                          </div>
                        </td>
                      )}
                      <td>{order.quantity}</td>
                      <td><strong>${order.total_price}</strong></td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        {getAvailableStatuses(order.status, userRole).length > 0 ? (
                          <div className="d-flex gap-1">
                            {statusUpdate[order.id] ? (
                              <div className="d-flex gap-1">
                                <select 
                                  className="form-select form-select-sm"
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  defaultValue=""
                                  style={{minWidth: '120px'}}
                                >
                                  <option value="">Select Status</option>
                                  {getAvailableStatuses(order.status, userRole).map(status => (
                                    <option key={status} value={status}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => setStatusUpdate({...statusUpdate, [order.id]: false})}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setStatusUpdate({...statusUpdate, [order.id]: true})}
                              >
                                Update Status
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;