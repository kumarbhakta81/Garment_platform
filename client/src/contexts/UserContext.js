import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // For now, we'll use a simple approach since we don't have jwt-decode
        // In a real app, you'd want to decode the JWT or fetch user info from API
        setIsAuthenticated(true);
        // We'll fetch user role from localStorage or API call
        const userRole = localStorage.getItem('userRole') || 'retailer';
        const userEmail = localStorage.getItem('userEmail') || '';
        setUser({ role: userRole, email: userEmail });
      } catch (error) {
        // eslint-disable-next-line no-console
      console.error('Error checking token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userData.role || 'retailer');
    localStorage.setItem('userEmail', userData.email || '');
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};