import React, { useState } from 'react';
import { signup } from '../api/authApi';

const Signup = ({ onSignup, goToLogin }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
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
      await signup(form);
      setMessage('User registered successfully!');
      setForm({ username: '', email: '', password: '' });
      setLoading(false);
      if (onSignup) onSignup();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
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
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
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
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={goToLogin}
          style={{
            background: 'none',
            color: '#007bff',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Login
        </button>
      </div>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};
export default Signup;
