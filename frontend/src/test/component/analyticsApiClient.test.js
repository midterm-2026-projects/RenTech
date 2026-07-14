import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = vi.hoisted(() => ({
  requestHandler: null,
  responseErrorHandler: null,
  get: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: store.get,
      interceptors: {
        request: { use: (fn) => { store.requestHandler = fn; } },
        response: { use: (_ok, errFn) => { store.responseErrorHandler = errFn; } },
      },
    }),
  },
}));

vi.mock('../../components/Login', () => ({
  getSession: vi.fn(() => ({ token: 'jwt-token' })),
  clearSession: vi.fn(),
}));

import { getAnalyticsDashboard } from '../../services/analyticsApiClient';
import { clearSession } from '../../components/Login';

describe('analytics API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.get.mockReset();
  });

  it('attaches the Bearer token from the session to every request', () => {
    const config = { headers: {} };
    const result = store.requestHandler(config);
    expect(result.headers.Authorization).toBe('Bearer jwt-token');
  });

  it('redirects to /login and clears the session on 401', async () => {
    delete window.location;
    window.location = { href: '' };

    const err = { response: { status: 401, data: { error: 'unauthorized' } } };
    await expect(store.responseErrorHandler(err)).rejects.toBe(err);
    expect(clearSession).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('also treats a 403 as unauthorized', async () => {
    delete window.location;
    window.location = { href: '' };
    const err = { response: { status: 403, data: {} } };
    await expect(store.responseErrorHandler(err)).rejects.toBe(err);
    expect(window.location.href).toBe('/login');
  });

  it('getAnalyticsDashboard returns arrays per source', async () => {
    store.get.mockImplementation((url) => {
      const map = {
        '/api/analytics/summaries': [{ id: 1 }],
        '/api/analytics/forecasts': [],
        '/api/analytics/kpis': [],
        '/api/analytics/revenue-projections': [],
      };
      return Promise.resolve({ data: map[url] || [] });
    });

    const result = await getAnalyticsDashboard();
    expect(result.summaries).toEqual([{ id: 1 }]);
    expect(result.forecasts).toEqual([]);
  });

  it('does not redirect on a non-auth error', async () => {
    delete window.location;
    window.location = { href: '' };
    const err = { response: { status: 500, data: {} } };
    await expect(store.responseErrorHandler(err)).rejects.toBe(err);
    expect(clearSession).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });
});
