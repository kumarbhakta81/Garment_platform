import React, { useState } from 'react';
import { login } from '../api/authApi';

const Login = ({ onLogin, goToSignup }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful!');
      setForm({ email: '', password: '' });
      setLoading(false);
      if (onLogin) onLogin();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '2rem auto',
        padding: 24,
        border: '1px solid #ddd',
        borderRadius: 8,
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          type="email"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          type="password"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        <span>Don't have an account? </span>
        <button
          type="button"
          onClick={goToSignup}
          style={{
            background: 'none',
            color: '#007bff',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Sign Up
        </button>
      </div>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};
export default Login;
