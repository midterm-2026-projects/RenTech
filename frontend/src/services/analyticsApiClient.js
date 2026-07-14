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

// Fetch all analytics sources in parallel. Each source degrades to an empty
// array on failure so one bad endpoint doesn't break the whole dashboard.
export async function getAnalyticsDashboard() {
  const settled = await Promise.allSettled([
    api.get('/api/analytics/summaries'),
    api.get('/api/analytics/forecasts'),
    api.get('/api/analytics/kpis'),
    api.get('/api/analytics/revenue-projections'),
  ]);

  const pick = (i) =>
    settled[i].status === 'fulfilled' ? settled[i].value.data : [];

  return {
    summaries: pick(0),
    forecasts: pick(1),
    kpis: pick(2),
    projections: pick(3),
  };
}

export default api;
