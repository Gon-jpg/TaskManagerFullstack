import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, usersAPI } from '../services/api'; // Import specific APIs
import { toast } from 'react-toastify'; // Import toast

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    toast.info('You have been logged out.');
    navigate('/');
  }, [navigate]);

  const validateSession = useCallback(async () => {
    if (!token) return;

    try {
      await authAPI.validateToken(); 
    } catch (error) {
      console.error("Session validation failed, logging out.", error);
      toast.error("Your session has expired. Please log in again.");
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    window.addEventListener('focus', validateSession);

    return () => {
      window.removeEventListener('focus', validateSession);
    };
  }, [validateSession]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (userData: { username: string; password: string }) => {
  try {
    await usersAPI.create(userData);
    toast.success('Registration successful! Please login.');
    navigate('/login');
  } catch (error: any) {
    console.error('Registration failed:', error);
    toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    throw error;
  }
};

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};