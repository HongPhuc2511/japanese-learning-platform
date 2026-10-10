import { createContext, useContext, useState } from 'react';
import api, { authApi, endpoints } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const res = await api.post(endpoints['login'], { username, password });
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (username, email, password) => {
    const res = await api.post(endpoints['register'], { username, email, password });
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getCurrentUser = async () => {
    const res = await authApi.get(endpoints['current-user']);
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.get(endpoints['current-user']);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Không làm mới được thông tin người dùng', err);
    }
  };

  const loginWithGoogle = async (credential) => {
  const res = await api.post(endpoints['google-login'], { credential });
  localStorage.setItem('access', res.data.access);
  localStorage.setItem('refresh', res.data.refresh);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  setUser(res.data.user);
};

  return (
    <AuthContext.Provider
      value={{ user, setUser, login,loginWithGoogle, register, logout, getCurrentUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);