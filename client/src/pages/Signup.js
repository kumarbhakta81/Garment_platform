import React, { useState } from 'react';
import { signup } from '../api/authApi';

const Signup = ({ onSignup }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await signup(form);
      setMessage('User registered successfully!');
      setForm({ username: '', email: '', password: '' });
      if (onSignup) onSignup();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required style={{ width: '100%', marginBottom: 8 }} />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" style={{ width: '100%', marginBottom: 8 }} />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" required type="password" style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%' }}>Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};
export default Signup;
