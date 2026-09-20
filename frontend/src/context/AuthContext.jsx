import { createContext, useContext, useState } from 'react';
import api, { endpoints, authApis } from '../api/api';

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
    const token = localStorage.getItem('access');
    const res = await authApis(token).get(endpoints['current-user']);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);