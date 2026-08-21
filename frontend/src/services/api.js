import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const url = err.config?.url || '';

    // Don't redirect for authentication endpoints
    const isAuthRequest =
      url.includes('/users/login') ||
      url.includes('/users/me') ||
      url.includes('/users/register') ||
      url.includes('/users/logout');

    if (status === 401 && !isAuthRequest) {
      window.location.href = '/';
    }

    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => api.post('/users/register', data),
  login:    (data) => api.post('/users/login', data),
  logout:   ()     => api.post('/users/logout'),
  me:       ()       => api.get('/users/me'),
};

export const products = {
  getAll:  ()           => api.get('/products'),
  getById: (id)         => api.get(`/products/${id}`),
  create:  (data)       => api.post('/products', data),
  update:  (id, data)   => api.put(`/products/${id}`, data),
  remove:  (id)         => api.delete(`/products/${id}`),
};

export const cart = {
  get:    ()              => api.get('/cart'),
  add:    (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (id, quantity)  => api.put(`/cart/${id}`, { quantity }),
  remove: (id)            => api.delete(`/cart/${id}`),
};

export const orders = {
  place:    (data) => api.post('/orders', data),
  myOrders: ()     => api.get('/orders'),
  getById:  (id)   => api.get(`/orders/${id}`),
};

export const admin = {
  users:             ()           => api.get('/admin/users'),
  updateUserStatus:  (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  orders:            ()           => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
};

export const inventory = {

  // Current products + current stock
  getProducts: () =>
    api.get('/admin/inventory/products'),

  // Inventory transaction history
  getAll: () =>
    api.get('/admin/inventory'),

  getProductHistory: (productId) =>
    api.get(`/admin/inventory/product/${productId}`),

  stockIn: (data) =>
    api.post('/admin/inventory/stock-in', data),

  stockOut: (data) =>
    api.post('/admin/inventory/stock-out', data),

  returnStock: (data) =>
    api.post('/admin/inventory/return', data),

  adjust: (data) =>
    api.post('/admin/inventory/adjust', data)
};

export default api;
