import axios from 'axios';

export const api = axios.create({
    baseURL: '/',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // Required for HttpOnly cookie to be sent automatically
});

export function setAuthHeader(token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthHeader() {
    delete api.defaults.headers.common['Authorization'];
}

// Response interceptor — handle 401 token expiry + auto-refresh via cookie
let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
    pendingQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    pendingQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // No body needed — refresh token sent as httpOnly cookie automatically
                const res = await api.post('/api/auth/refresh');
                const { accessToken } = res.data.data;

                setAuthHeader(accessToken);
                processQueue(null, accessToken);

                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                clearAuthHeader();
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ─── API Functions ─────────────────────────────────────────────────────────────

export const directorsApi = {
    getAll: () => api.get('/api/directors'),
    getOne: (id) => api.get(`/api/directors/${id}`),
    create: (data) => api.post('/api/directors', data),
    update: (id, data) => api.put(`/api/directors/${id}`, data),
    delete: (id) => api.delete(`/api/directors/${id}`),
};

export const reportsApi = {
    getAll: (params) => api.get('/api/reports', { params }),
    getOne: (id) => api.get(`/api/reports/${id}`),
    getBySlug: (directorName, month, year, last4cc) =>
        api.get(`/api/reports/detail/${encodeURIComponent(directorName)}/${month}/${year}/${last4cc}`),
    create: (data) => api.post('/api/reports', data),
    update: (id, data) => api.put(`/api/reports/${id}`, data),
    delete: (id) => api.delete(`/api/reports/${id}`),
    logExport: (id, format) => api.post(`/api/reports/${id}/log-export/${format}`),
};

export const transactionsApi = {
    create: (reportId, data) => api.post(`/api/reports/${reportId}/transactions`, data),
    update: (id, data) => api.put(`/api/transactions/${id}`, data),
    delete: (id) => api.delete(`/api/transactions/${id}`),
};

export const usersApi = {
    getAll: () => api.get('/api/users'),
    create: (data) => api.post('/api/users', data),
    update: (id, data) => api.put(`/api/users/${id}`, data),
    delete: (id) => api.delete(`/api/users/${id}`),
    changePassword: (data) => api.post('/api/users/me/change-password', data),
};
