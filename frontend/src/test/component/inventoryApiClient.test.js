import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = vi.hoisted(() => ({
  requestHandler: null,
  responseErrorHandler: null,
  get: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: store.get,
      patch: store.patch,
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

import {
  getProducts,
  getTransactions,
  updateTransactionStatus,
} from '../../services/inventoryApiClient';
import { clearSession } from '../../components/Login';

describe('inventory API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.get.mockReset();
    store.patch.mockReset();
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

  it('does not redirect on a non-auth error', async () => {
    delete window.location;
    window.location = { href: '' };
    const err = { response: { status: 500, data: {} } };
    await expect(store.responseErrorHandler(err)).rejects.toBe(err);
    expect(clearSession).not.toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  it('getProducts requests /api/products with page, limit, search and status params', async () => {
    store.get.mockResolvedValue({
      data: { data: [{ id: 1, name: 'Gown' }], total: 1, totalPages: 1 },
    });

    const result = await getProducts({ page: 2, limit: 8, search: 'gown', status: 'Available' });

    expect(store.get).toHaveBeenCalledWith('/api/products', {
      params: { page: 2, limit: 8, search: 'gown', status: 'Available' },
    });
    expect(result.data).toEqual([{ id: 1, name: 'Gown' }]);
  });

  it('getProducts omits search/status when not supplied', async () => {
    store.get.mockResolvedValue({ data: { data: [], total: 0, totalPages: 1 } });

    await getProducts({ page: 1, limit: 8 });

    expect(store.get).toHaveBeenCalledWith('/api/products', {
      params: { page: 1, limit: 8 },
    });
  });

  it('getTransactions requests /api/transactions with the given filters', async () => {
    store.get.mockResolvedValue({ data: { data: [{ id: 'TX-1' }], total: 1, totalPages: 1 } });

    const result = await getTransactions({ page: 1, limit: 10, search: 'TX-1', status: 'Active' });

    expect(store.get).toHaveBeenCalledWith('/api/transactions', {
      params: { page: 1, limit: 10, search: 'TX-1', status: 'Active' },
    });
    expect(result.data).toEqual([{ id: 'TX-1' }]);
  });

  it('updateTransactionStatus PATCHes /api/transactions/:id with the new status', async () => {
    store.patch.mockResolvedValue({ data: { status: 'Returned', data: { id: 'TX-1' } } });

    const result = await updateTransactionStatus('TX-1', 'Returned');

    expect(store.patch).toHaveBeenCalledWith('/api/transactions/TX-1', { status: 'Returned' });
    expect(result.data.id).toBe('TX-1');
  });
});
