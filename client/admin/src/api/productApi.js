import axios from 'axios';

const API_URL = 'http://localhost:5002/api/products';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data;
};
export const addProduct = async (prod) => {
  await axios.post(API_URL, prod, { headers: getAuthHeader() });
};
export const updateProduct = async (id, prod) => {
  await axios.put(`${API_URL}/${id}`, prod, { headers: getAuthHeader() });
};
