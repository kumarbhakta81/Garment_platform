import axios from 'axios';

const API_URL = 'http://localhost:5001/api/notifications';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await axios.get(`${API_URL}?${params}`, { headers: getAuthHeader() });
  return res.data;
};

export const getNotificationCounts = async () => {
  const res = await axios.get(`${API_URL}/counts`, { headers: getAuthHeader() });
  return res.data;
};

export const getAllNotifications = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await axios.get(`${API_URL}/all?${params}`, { headers: getAuthHeader() });
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await axios.patch(`${API_URL}/${id}/read`, {}, { headers: getAuthHeader() });
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await axios.patch(`${API_URL}/mark-all-read`, {}, { headers: getAuthHeader() });
  return res.data;
};

export const deleteNotification = async (id) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};