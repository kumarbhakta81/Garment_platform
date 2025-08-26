import axios from 'axios';

const API_URL = 'http://localhost:5001/api/orders';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await axios.get(`${API_URL}?${params}`, { headers: getAuthHeader() });
  return res.data;
};

export const createOrder = async (orderData) => {
  const res = await axios.post(API_URL, orderData, { headers: getAuthHeader() });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await axios.patch(`${API_URL}/${id}/status`, { status }, { headers: getAuthHeader() });
  return res.data;
};

export const getOrderAnalytics = async () => {
  const res = await axios.get(`${API_URL}/analytics`, { headers: getAuthHeader() });
  return res.data;
};