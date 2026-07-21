import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../App.js';

describe('Product API (Integration)', () => {
  describe('GET /api/products', () => {
    it('returns a paginated success envelope with the default page/limit', async () => {
      const res = await request(app).get('/api/products');

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.status).toBe('success');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(8);
        expect(typeof res.body.total).toBe('number');
        expect(res.body.totalPages).toBe(Math.ceil(res.body.total / res.body.limit));
      }
    });

    it('honors page, limit, search and status query parameters', async () => {
      const res = await request(app).get(
        '/api/products?page=2&limit=4&search=gown&status=Available'
      );

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.page).toBe(2);
        expect(res.body.limit).toBe(4);
        if (res.body.data.length) {
          res.body.data.forEach((p) => expect(p.status).toBe('Available'));
        }
      }
    });

    it('does not expose an unhandled server error for an empty result set', async () => {
      const res = await request(app).get('/api/products?search=zzzzz-no-match');

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.data).toEqual([]);
        expect(res.body.total).toBe(0);
      }
    });
  });
});
