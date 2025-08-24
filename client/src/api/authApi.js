import axios from 'axios';

const API_URL = 'http://localhost:5002/api/auth';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// User registration
export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

// User login with JWT
export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

// User logout
export const logout = async () => {
  const res = await axios.post(`${API_URL}/logout`, {}, { headers: getAuthHeader() });
  return res.data;
};

// Get current user profile
export const getProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`, { headers: getAuthHeader() });
  return res.data;
};

// Refresh JWT token
export const refreshToken = async () => {
  const res = await axios.post(`${API_URL}/refresh-token`, {}, { headers: getAuthHeader() });
  return res.data;
};

// Legacy support (keeping old signup for compatibility)
export const signup = register;
