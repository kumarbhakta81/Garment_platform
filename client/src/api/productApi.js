import axios from 'axios';

const API_URL = 'http://localhost:5001/api/products';

export const getProducts = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
export const addProduct = async (prod) => {
  await axios.post(API_URL, prod);
};
export const updateProduct = async (id, prod) => {
  await axios.put(`${API_URL}/${id}`, prod);
};
