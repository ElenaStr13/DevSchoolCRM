import api from '../api/axios';

export const AuthService = {
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

    async login(email: string, password: string) {
        const res = await api.post('/auth/login', { email, password });
        return res.data;
    },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
