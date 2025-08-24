import axios from 'axios';

const API_URL = 'http://localhost:5002/api/wishlist';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get user's wishlist
export const getWishlist = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data;
};

// Add product to wishlist
export const addToWishlist = async (product_id) => {
  const res = await axios.post(`${API_URL}/items`, 
    { product_id }, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  const res = await axios.delete(`${API_URL}/items/${productId}`, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Clear entire wishlist
export const clearWishlist = async () => {
  const res = await axios.delete(API_URL, { headers: getAuthHeader() });
  return res.data;
};

// Move wishlist item to cart
export const moveToCart = async (productId, variant_id) => {
  const res = await axios.post(`${API_URL}/move-to-cart/${productId}`, 
    { variant_id }, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Get wishlist item count
export const getWishlistCount = async () => {
  const res = await axios.get(`${API_URL}/count`, { headers: getAuthHeader() });
  return res.data;
};

// Get wishlist-based recommendations
export const getRecommendations = async (limit = 10) => {
  const res = await axios.get(`${API_URL}/recommendations?limit=${limit}`, 
    { headers: getAuthHeader() }
  );
  return res.data;
};