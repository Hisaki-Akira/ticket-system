import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import StaffTicketing from './components/StaffTicketing';
import DepartureBoard from './components/DepartureBoard';
import AdminLogin from './components/AdminLogin';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  return (
    <HashRouter>
      <Routes>
        {/* Customer Display Route */}
        <Route path="/" element={<DepartureBoard />} />
        
        {/* Staff Admin Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? (
              <StaffTicketing onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
}

