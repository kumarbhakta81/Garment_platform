import React, { useState } from 'react';
import { logout } from './api/authApi';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  const [page, setPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
    setPage('dashboard');
  };
  const handleSignup = () => {
    setPage('login');
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Optionally show error
    }
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setPage('login');
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <button style={{position:'absolute',top:10,right:10}} onClick={handleLogout}>Logout</button>
          <Dashboard />
        </>
      ) : (
        <>
          {page === 'login' && <Login onLogin={handleLogin} goToSignup={() => setPage('signup')} />}
          {page === 'signup' && <Signup onSignup={handleSignup} goToLogin={() => setPage('login')} />}
        </>
      )}
    </div>
  );
}

export default App;
