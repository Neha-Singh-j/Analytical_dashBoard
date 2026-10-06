import axios from 'axios';

// Use /api for Vite dev server proxy or direct http://127.0.0.1:8000/api
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // Authentication APIs
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (name, email, password, role = 'Data Analyst') => {
    const response = await apiClient.post('/auth/signup', { name, email, password, role });
    return response.data;
  },

  getMe: async (email) => {
    const response = await apiClient.get('/auth/me', { params: { email } });
    return response.data;
  },

  // Analytics APIs
  getSummary: async (params = {}) => {
    const response = await apiClient.get('/analytics/summary', { params });
    return response.data;
  },

  getCurrencies: async () => {
    const response = await apiClient.get('/analytics/currencies');
    return response.data;
  },

  // Orders APIs
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (orderId, currency = 'USD') => {
    const response = await apiClient.get(`/orders/${orderId}`, { params: { currency } });
    return response.data;
  },

  // Products & Shipments APIs
  getProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  getShipments: async () => {
    const response = await apiClient.get('/shipments');
    return response.data;
  },

  // Ingestion APIs
  getIngestionLogs: async () => {
    const response = await apiClient.get('/ingest/logs');
    return response.data;
  },

  triggerIngestFile: async (type, file) => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post(`/ingest/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await apiClient.post(`/ingest/${type}`);
      return response.data;
    }
  },

  triggerIngestAll: async () => {
    const response = await apiClient.post('/ingest/all');
    return response.data;
  },
};
