import axios from 'axios';

const API_URL = 'http://localhost:5001/api/categories';

export const getCategories = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
export const addCategory = async (cat) => {
  await axios.post(API_URL, cat);
};
export const updateCategory = async (id, cat) => {
  await axios.put(`${API_URL}/${id}`, cat);
};
