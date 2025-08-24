import React, { useState } from 'react';
import { login } from '../api/authApi';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful!');
      setForm({ email: '', password: '' });
      if (onLogin) onLogin();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" style={{ width: '100%', marginBottom: 8 }} />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required type="password" style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%' }}>Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};
export default Login;
