import axios from 'axios';
import Cookies from 'js-cookie';

// Use internal Next.js API routes — works in both dev and production on Vercel
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  create: (data: unknown) => api.post('/products', data),
  update: (id: number, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  search: (q: string) => api.get('/products', { params: { search: q } }),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: number, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => { Cookies.remove('token'); },
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: unknown) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id: number) => api.get(`/orders/${id}`),
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/orders', { params }),
  updateStatus: (id: number, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

// ─── Users (Admin) ───────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: unknown) => api.put(`/users/${id}`, data),
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const couponsApi = {
  validate: (code: string) => api.post('/coupons/validate', { code }),
};

export default api;
