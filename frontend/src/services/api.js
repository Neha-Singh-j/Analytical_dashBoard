import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  return 'https://analytical-dashboard-ns.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

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

  // Countries Intelligence APIs
  getCountries: async (params = {}) => {
    const response = await apiClient.get('/countries', { params });
    return response.data;
  },

  getCountriesSummary: async () => {
    const response = await apiClient.get('/countries/summary');
    return response.data;
  },

  syncCountries: async () => {
    const response = await apiClient.post('/countries/sync');
    return response.data;
  },

  getCountryByCode: async (code) => {
    const response = await apiClient.get(`/countries/${code}`);
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
  getIngestionLogs: async (params = {}) => {
    const response = await apiClient.get('/ingest/logs', { params });
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
