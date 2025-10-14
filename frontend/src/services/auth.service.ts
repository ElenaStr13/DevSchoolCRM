import api from '../api/axios';

export const AuthService = {
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
