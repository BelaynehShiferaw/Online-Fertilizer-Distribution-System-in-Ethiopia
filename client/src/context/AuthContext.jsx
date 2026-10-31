import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ofdms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [farmerProfile, setFarmerProfile] = useState(() => {
    const saved = localStorage.getItem('ofdms_farmer_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setFarmerProfile(res.data.farmerProfile);
          localStorage.setItem('ofdms_user', JSON.stringify(res.data.user));
          if (res.data.farmerProfile) {
            localStorage.setItem('ofdms_farmer_profile', JSON.stringify(res.data.farmerProfile));
          }
        }
      } catch (err) {
        setUser(null);
        setFarmerProfile(null);
        localStorage.removeItem('ofdms_token');
        localStorage.removeItem('ofdms_user');
        localStorage.removeItem('ofdms_farmer_profile');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setFarmerProfile(res.data.farmerProfile);
      if (res.data.token) {
        localStorage.setItem('ofdms_token', res.data.token);
      }
      localStorage.setItem('ofdms_user', JSON.stringify(res.data.user));
      if (res.data.farmerProfile) {
        localStorage.setItem('ofdms_farmer_profile', JSON.stringify(res.data.farmerProfile));
      }
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setUser(res.data.user);
      setFarmerProfile(res.data.farmerProfile);
      if (res.data.token) {
        localStorage.setItem('ofdms_token', res.data.token);
      }
      localStorage.setItem('ofdms_user', JSON.stringify(res.data.user));
      if (res.data.farmerProfile) {
        localStorage.setItem('ofdms_farmer_profile', JSON.stringify(res.data.farmerProfile));
      }
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setFarmerProfile(null);
      localStorage.removeItem('ofdms_token');
      localStorage.removeItem('ofdms_user');
      localStorage.removeItem('ofdms_farmer_profile');
      window.location.href = '/login';
    }
  };

  const updateUserProfile = (updatedUser, updatedProfile) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('ofdms_user', JSON.stringify(updatedUser));
    }
    if (updatedProfile) {
      setFarmerProfile(updatedProfile);
      localStorage.setItem('ofdms_farmer_profile', JSON.stringify(updatedProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farmerProfile,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
