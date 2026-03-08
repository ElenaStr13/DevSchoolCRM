import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

type RetryableRequest = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || '/api',
    withCredentials: true,
});

const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;

let failedQueue: {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest | undefined;
        const status = error.response?.status;
        const requestUrl = originalRequest?.url || '';

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isLoginRequest = requestUrl.includes('/auth/login');
        const isRefreshRequest = requestUrl.includes('/auth/refresh');

        if (status !== 401) {
            return Promise.reject(error);
        }

        if (isLoginRequest) {
            return Promise.reject(error);
        }

        if (isRefreshRequest) {
            clearAuthData();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token: string) => {
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    },
                    reject: (err) => reject(err),
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const res = await api.post('/auth/refresh', { refreshToken });

            const { accessToken, refreshToken: newRefreshToken } = res.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            processQueue(null, accessToken);

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            clearAuthData();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;