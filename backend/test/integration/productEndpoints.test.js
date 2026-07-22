import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../App.js';

const AUTH_TOKEN = Buffer.from('admin:Admin:1740000000000').toString('base64');
const auth = { Authorization: `Bearer ${AUTH_TOKEN}` };

function buildSupabase() {
  const q = {
    from: () => q,
    select: () => q,
    ilike: () => q,
    eq: () => q,
    order: () => q,
    range: () => q,
    then: (fn) => fn({ data: [], error: null, count: 0 }),
  };
  return q;
}

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: () => buildSupabase(),
}));

describe('Product API (Integration)', () => {
  describe('GET /api/products', () => {
    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
    });

    it('returns a paginated success envelope with the default page/limit', async () => {
      const res = await request(app).get('/api/products').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(8);
      expect(typeof res.body.total).toBe('number');
      expect(res.body.totalPages).toBe(Math.ceil(res.body.total / res.body.limit));
    });

    it('honors page, limit, search and status query parameters', async () => {
      const res = await request(app).get('/api/products?page=2&limit=4&search=gown&status=Available').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(4);
    });

    it('does not expose an unhandled server error for an empty result set', async () => {
      const res = await request(app).get('/api/products?search=zzzzz-no-match').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });
});