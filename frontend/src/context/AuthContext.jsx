import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('nexus_auth_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse URL for OAuth tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('nexus_auth_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // When token changes, store it and fetch the user
  useEffect(() => {
    if (token) {
      localStorage.setItem('nexus_auth_token', token);
      fetchUser(token);
    } else {
      localStorage.removeItem('nexus_auth_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token might be expired or invalid
        setToken(null);
      }
    } catch (e) {
      console.error('Failed to fetch user', e);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/api/users/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    setToken(data.access_token);
    return true;
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
        confirm_password: confirmPassword
      })
    });

    if (!res.ok) {
        const errData = await res.json();
        const msg = Array.isArray(errData.detail) ? errData.detail[0].msg : (errData.detail || 'Registration failed');
        throw new Error(msg);
    }

    // Auto-login after registration
    return await login(email, password);
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
