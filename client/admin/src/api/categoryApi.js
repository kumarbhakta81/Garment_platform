import axios from 'axios';

const API_URL = 'http://localhost:5002/api/categories';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCategories = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data;
};
export const addCategory = async (cat) => {
  await axios.post(API_URL, cat, { headers: getAuthHeader() });
};
export const updateCategory = async (id, cat) => {
  await axios.put(`${API_URL}/${id}`, cat, { headers: getAuthHeader() });
};
