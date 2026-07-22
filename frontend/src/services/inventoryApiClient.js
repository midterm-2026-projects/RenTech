import axios from 'axios';
import { getSession, clearSession } from '../components/Login';

const BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach the session JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const session = getSession();
  if (session && session.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// On an unauthorized response, clear the session and send the user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.error || '';
    const unauthorized =
      status === 401 || status === 403 || /unauthorized/i.test(String(message));

    if (unauthorized) {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Paginated inventory products.
export async function getProducts({ page = 1, limit = 8, search = '', status = '' } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  const res = await api.get('/api/products', { params });
  return res.data; // { status, data, page, limit, total, totalPages }
}

// Soft-delete an inventory item (flags it deleted without removing history).
export async function softDeleteProduct(id) {
  const res = await api.patch(`/api/products/${encodeURIComponent(id)}/soft-delete`);
  return res.data; // { status, message }
}

// Paginated transactions (admin Records view).
export async function getTransactions({ page = 1, limit = 10, search = '', status = '' } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  const res = await api.get('/api/transactions', { params });
  return res.data; // { status, data, page, limit, total, totalPages }
}

// Create a new transaction (booking).
export async function createTransaction(data) {
  const res = await api.post('/api/transactions', data);
  return res.data;
}

// Persist a transaction status change (e.g. mark Returned via the ↩ button).
export async function updateTransactionStatus(id, status) {
  const res = await api.patch(`/api/transactions/${encodeURIComponent(id)}`, { status });
  return res.data; // { status, data }
}

export default api;
