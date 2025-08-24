import axios from 'axios';

const API_URL = 'http://localhost:5002/api/products';
const ADMIN_API_URL = 'http://localhost:5002/api/admin/products';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Public product endpoints (no auth required)
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const res = await axios.get(`${API_URL}?${params.toString()}`);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const getProductVariants = async (id) => {
  const res = await axios.get(`${API_URL}/${id}/variants`);
  return res.data;
};

export const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({ q: query });
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const res = await axios.get(`${API_URL}/search?${params.toString()}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
};

export const getBrands = async () => {
  const res = await axios.get(`${API_URL}/brands`);
  return res.data;
};

// Admin endpoints (auth required)
export const addProduct = async (product) => {
  const res = await axios.post(ADMIN_API_URL, product, { headers: getAuthHeader() });
  return res.data;
};

export const updateProduct = async (id, product) => {
  const res = await axios.put(`${ADMIN_API_URL}/${id}`, product, { headers: getAuthHeader() });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${ADMIN_API_URL}/${id}`, { headers: getAuthHeader() });
  return res.data;
};
