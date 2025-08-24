import axios from 'axios';

const API_URL = 'http://localhost:5002/api/auth';

export const signup = async (data) => {
  return axios.post(`${API_URL}/signup`, data);
};

export const login = async (data) => {
  return axios.post(`${API_URL}/login`, data);
};

export const logout = async () => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/logout`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
