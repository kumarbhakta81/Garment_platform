import axios from 'axios';

const API_URL = 'http://localhost:5002/api/cart';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get user's cart
export const getCart = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data;
};

// Add product variant to cart
export const addToCart = async (variant_id, quantity = 1) => {
  const res = await axios.post(`${API_URL}/items`, 
    { variant_id, quantity }, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  const res = await axios.put(`${API_URL}/items/${itemId}`, 
    { quantity }, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Remove specific cart item (Challenge Solution)
export const removeCartItem = async (itemId) => {
  const res = await axios.delete(`${API_URL}/items/${itemId}`, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Clear entire cart
export const clearCart = async () => {
  const res = await axios.delete(API_URL, { headers: getAuthHeader() });
  return res.data;
};

// Get cart summary and totals
export const getCartSummary = async () => {
  const res = await axios.get(`${API_URL}/summary`, { headers: getAuthHeader() });
  return res.data;
};

// Move cart item to wishlist
export const moveToWishlist = async (itemId) => {
  const res = await axios.post(`${API_URL}/move-to-wishlist/${itemId}`, 
    {}, 
    { headers: getAuthHeader() }
  );
  return res.data;
};

// Validate cart items
export const validateCart = async () => {
  const res = await axios.get(`${API_URL}/validate`, { headers: getAuthHeader() });
  return res.data;
};