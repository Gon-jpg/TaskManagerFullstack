import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

const App: React.FC = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      
      <Route 
        path="/login" 
        element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/register" 
        element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />} 
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;