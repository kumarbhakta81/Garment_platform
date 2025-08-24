import axios from 'axios';

const API_URL = 'http://localhost:5002/api/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUsers = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() });
  return res.data;
};
export const deleteUser = async (id) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};
export const updateUser = async (id, user) => {
  await axios.put(`${API_URL}/${id}`, user, { headers: getAuthHeader() });
};
