import { createContext, useContext, useState } from 'react';
import api, { authApi, endpoints } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const startSession = (data) => {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (username, password) => {
    const res = await api.post(endpoints['login'], { username, password });
    startSession(res.data);
  };

  const register = async (username, email, password) => {
    const res = await api.post(endpoints['register'], { username, email, password });
    startSession(res.data);
  };

  const loginWithGoogle = async (credential) => {
    const res = await api.post(endpoints['google-login'], { credential });
    startSession(res.data);
  };

  const loginWithFacebook = async (accessToken) => {
    const res = await api.post(endpoints['facebook-login'], { access_token: accessToken });
    startSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('assistant_chat');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        getCurrentUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);