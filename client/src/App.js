import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <div>
      {!isAuthenticated ? (
        <>
          <Login />
          <Signup />
        </>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
