import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../App.js';

const AUTH_TOKEN = Buffer.from('admin:Admin:1740000000000').toString('base64');
const auth = { Authorization: `Bearer ${AUTH_TOKEN}` };

const mockRows = [
  { id: "TX-1001", username: "ana rivera", item: "Vintage Gatsby Sequin Dress", price_per_day: 500, days_rented: 3, amount: 1500, status: "Active", date: "2026-05-01", created_at: "2026-05-01T00:00:00Z" },
  { id: "TX-1002", username: "carlos mendez", item: "Barong Tagalog", price_per_day: 400, days_rented: 2, amount: 800, status: "Active", date: "2026-05-02", created_at: "2026-05-02T00:00:00Z" },
  { id: "TX-1003", username: "liza santos", item: "Emerald Velvet Gown", price_per_day: 600, days_rented: 3, amount: 1800, status: "Active", date: "2026-05-03", created_at: "2026-05-03T00:00:00Z" },
  { id: "TX-1004", username: "daniel cruz", item: "Black Tuxedo", price_per_day: 700, days_rented: 2, amount: 1400, status: "Returned", date: "2026-05-04", created_at: "2026-05-04T00:00:00Z" },
  { id: "TX-1005", username: "isabel garcia", item: "Champagne Silk Gown", price_per_day: 850, days_rented: 2, amount: 1700, status: "Active", date: "2026-05-02", created_at: "2026-05-02T00:00:00Z" },
];

function buildSupabase() {
  let filters = [];
  const resolve = (f) => {
    let results = [...mockRows];
    for (const f2 of f) {
      if (f2.type === 'ilike') {
        const pattern = f2.val.replace(/%/g, '').toLowerCase();
        results = results.filter(r => String(r[f2.col] || '').toLowerCase().includes(pattern));
      }
      if (f2.type === 'eq') results = results.filter(r => r[f2.col] === f2.val);
      if (f2.type === 'in') results = results.filter(r => f2.vals.includes(r[f2.col]));
    }
    return { data: results, error: null, count: results.length };
  };
  const q = {
    from: () => q,
    select: () => q,
    ilike: (col, val) => { filters.push({ type: 'ilike', col, val }); return q; },
    in: (col, vals) => { filters.push({ type: 'in', col, vals }); return q; },
    eq: (col, val) => { filters.push({ type: 'eq', col, val }); return q; },
    order: () => q,
    range: () => q,
    or: () => q,
    neq: () => q,
    then: (fn) => { const f = filters.splice(0); return Promise.resolve(resolve(f)).then(fn); },
  };
  return q;
}

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: () => buildSupabase(),
}));

describe('Transaction History & Summary API (Integration)', () => {
  describe('GET /api/transactions/history', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/transactions/history');
      expect(res.status).toBe(401);
    });

    it('should return all rental records when no filters are applied', async () => {
      const res = await request(app).get('/api/transactions/history').set(auth);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(5);
    });

    it('should return records containing id and totalCost fields', async () => {
      const res = await request(app).get('/api/transactions/history').set(auth);
      expect(res.status).toBe(200);
      res.body.forEach(record => {
        expect(record).toHaveProperty('id');
        expect(record).toHaveProperty('totalCost');
        expect(record).toHaveProperty('username');
        expect(record).toHaveProperty('itemName');
        expect(record).toHaveProperty('status');
      });
    });

    it('should filter records by username query parameter', async () => {
      const res = await request(app).get('/api/transactions/history?username=carlos').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('carlos mendez');
    });

    it('should filter records by status query parameter', async () => {
      const res = await request(app).get('/api/transactions/history?status=Returned').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      res.body.forEach(record => {
        expect(record.status).toBe('Returned');
      });
    });

    it('should filter records by itemName using partial match', async () => {
      const res = await request(app).get('/api/transactions/history?itemName=Barong').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].itemName).toBe('Barong Tagalog');
    });

    it('should filter by multiple query parameters combined', async () => {
      const res = await request(app).get('/api/transactions/history?username=liza&status=Active').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('liza santos');
      expect(res.body[0].status).toBe('Active');
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/transactions/summary');
      expect(res.status).toBe(401);
    });

    it('should return correct totalTransactions matching the database count', async () => {
      const res = await request(app).get('/api/transactions/summary').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBe(5);
    });

    it('should return correct totalRevenue matching sum of all totalCost values', async () => {
      const res = await request(app).get('/api/transactions/summary').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalRevenue).toBe(7200);
    });

    it('should return correct statusCounts from the ledger', async () => {
      const res = await request(app).get('/api/transactions/summary').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.statusCounts).toEqual({ Active: 4, Returned: 1 });
    });

    it('should return summary for a specific user when username is provided', async () => {
      const res = await request(app).get('/api/transactions/summary?username=daniel').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBe(1);
      expect(res.body.totalRevenue).toBe(1400);
      expect(res.body.statusCounts).toEqual({ Returned: 1 });
    });

    it('should return zero totals when username matches no records', async () => {
      const res = await request(app).get('/api/transactions/summary?username=nonexistent').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBe(0);
      expect(res.body.totalRevenue).toBe(0);
      expect(res.body.statusCounts).toEqual({});
    });
  });

  describe('GET /api/transactions/costs', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/transactions/costs');
      expect(res.status).toBe(401);
    });

    it('should return cost breakdown for all transactions', async () => {
      const res = await request(app).get('/api/transactions/costs').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(5);
      expect(res.body.breakdown.length).toBe(5);
    });

    it('should calculate totalCost as pricePerDay * daysRented for each record', async () => {
      const res = await request(app).get('/api/transactions/costs').set(auth);
      expect(res.status).toBe(200);
      res.body.breakdown.forEach(item => {
        expect(item.totalCost).toBe(item.pricePerDay * item.daysRented);
      });
    });

    it('should calculate correct aggregate totalCost across all records', async () => {
      const res = await request(app).get('/api/transactions/costs').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalCost).toBe(7200);
    });

    it('should calculate correct averageCostPerItem', async () => {
      const res = await request(app).get('/api/transactions/costs').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.averageCostPerItem).toBe(1440);
    });

    it('should return cost breakdown for a single transaction by ID', async () => {
      const res = await request(app).get('/api/transactions/costs?transactionId=TX-1001').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(1);
      expect(res.body.breakdown[0].id).toBe('TX-1001');
      expect(res.body.breakdown[0].totalCost).toBe(1500);
    });
  });
});