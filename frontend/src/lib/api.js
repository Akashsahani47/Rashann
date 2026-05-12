'use client';

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const buyerAPI = {
  createShoppingList: (data) => api.post('/buyer/shopping-list', data),
  getShoppingLists: () => api.get('/buyer/shopping-lists'),
  getLastShoppingList: () => api.get('/buyer/shopping-lists/last'),
  getShoppingListByMonth: (month) => api.get(`/buyer/shopping-lists/${month}`),
  updateShoppingList: (id, data) => api.put(`/buyer/shopping-list/${id}`, data),
  shareShoppingList: (id, shopkeeperId) =>
    api.post(`/buyer/shopping-list/${id}/share`, { shopkeeperId }),
  getShopkeepers: () => api.get('/buyer/shopkeepers'),
  getLedger: () => api.get('/buyer/ledger'),
  getLedgerWith: (shopkeeperId) => api.get(`/buyer/ledger/${shopkeeperId}`),
  recordPayment: (data) => api.post('/buyer/ledger/payment', data),
};

export const shopkeeperAPI = {
  getShoppingLists: () => api.get('/shopkeeper/shopping-lists'),
  getCustomerLists: (buyerId) =>
    api.get(`/shopkeeper/customer/${buyerId}/lists`),
  getCustomers: () => api.get('/shopkeeper/customers'),
  markAsCompleted: (id, actualPrice) =>
    api.put(`/shopkeeper/shopping-list/${id}/complete`, { actualPrice }),
  getLedger: () => api.get('/shopkeeper/ledger'),
  recordPayment: (data) => api.post('/shopkeeper/ledger/payment', data),
  getMe: () => api.get('/shopkeeper/me'),
  updateMe: (data) => api.put('/shopkeeper/me', data),
};

export default api;
