import React, { useState } from 'react';
import { login } from '../api/authApi';

const Login = ({ onLogin, goToSignup }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await login(form);
      const token = res.data.token;
      
      localStorage.setItem('token', token);
      
      // For demo purposes, set role based on email
      // In real app, this would come from the JWT token or API response
      let role = 'retailer';
      if (form.email.includes('admin')) {
        role = 'admin';
      } else if (form.email.includes('wholesaler')) {
        role = 'wholesaler';
      }
      
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', form.email);
      
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              
              {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    id="email"
                    name="email" 
                    type="email"
                    className="form-control"
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="Enter your email" 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    id="password"
                    name="password" 
                    type="password"
                    className="form-control"
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder="Enter your password" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              
              <div className="text-center mt-3">
                <span>Don't have an account? </span>
                <button 
                  type="button" 
                  onClick={goToSignup} 
                  className="btn btn-link p-0 text-decoration-none"
                >
                  Sign Up
                </button>
              </div>

              {/* Demo credentials info */}
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Demo Credentials:</strong><br/>
                  Admin: admin@example.com<br/>
                  Wholesaler: wholesaler@example.com<br/>
                  Retailer: retailer@example.com<br/>
                  Password: any password
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
