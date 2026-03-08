import api from '../api/axios';

export const AuthService = {
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

    async login(email: string, password: string) {
        const res = await api.post('/auth/login', { email, password });

        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        return res.data;
    },

    async refresh() {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refreshToken");

        const res = await api.post("/auth/refresh", { refreshToken });

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken); // важливо оновлювати теж
        return res.data;
    },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },
};
