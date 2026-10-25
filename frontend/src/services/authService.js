import api from './api';

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.success && res.data) {
      localStorage.setItem('retailnexus_token', res.data.token);
      localStorage.setItem('retailnexus_user', JSON.stringify(res.data));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('retailnexus_token');
    localStorage.removeItem('retailnexus_user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('retailnexus_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('retailnexus_token');
  }
};
