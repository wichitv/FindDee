import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'finddee_token';
const USER_KEY = 'finddee_user';

export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
  const { token, user } = res.data;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export const getCurrentUser = () => {
  const raw = sessionStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
