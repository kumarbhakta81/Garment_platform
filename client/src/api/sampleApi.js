import axios from 'axios';

const API_URL = 'http://localhost:5001/api/samples';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSamples = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const res = await axios.get(`${API_URL}?${params}`, { headers: getAuthHeader() });
  return res.data;
};

export const createSample = async (formData) => {
  const res = await axios.post(API_URL, formData, { 
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateSample = async (id, formData) => {
  const res = await axios.put(`${API_URL}/${id}`, formData, { 
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteSample = async (id) => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

export const updateSampleStatus = async (id, status) => {
  const res = await axios.patch(`${API_URL}/${id}/status`, { status }, { headers: getAuthHeader() });
  return res.data;
};