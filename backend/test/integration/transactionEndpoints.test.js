import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../App.js';

describe('Transaction History & Summary API (Integration)', () => {
  // GET /api/transactions/history
  describe('GET /api/transactions/history', () => {
    it('should return all rental records when no filters are applied', async () => {
      const res = await request(app).get('/api/transactions/history');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(5);
    });

    it('should return records containing id and totalCost fields', async () => {
      const res = await request(app).get('/api/transactions/history');
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
      const res = await request(app).get('/api/transactions/history?username=carlos');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('carlos mendez');
    });

    it('should filter records by status query parameter', async () => {
      const res = await request(app).get('/api/transactions/history?status=Returned');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      res.body.forEach(record => {
        expect(record.status).toBe('Returned');
      });
    });

    it('should filter records by itemName using partial match', async () => {
      const res = await request(app).get('/api/transactions/history?itemName=Barong');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].itemName).toBe('Barong Tagalog');
    });

    it('should filter by multiple query parameters combined', async () => {
      const res = await request(app).get('/api/transactions/history?username=liza&status=Active');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('liza santos');
      expect(res.body[0].status).toBe('Active');
    });
  });

  // GET /api/transactions/summary
  describe('GET /api/transactions/summary', () => {
    it('should return correct totalTransactions matching the database count', async () => {
      const res = await request(app).get('/api/transactions/summary');
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBe(5);
    });

    it('should return correct totalRevenue matching sum of all totalCost values', async () => {
      const res = await request(app).get('/api/transactions/summary');
      expect(res.status).toBe(200);
      // 1500 + 800 + 1800 + 1400 + 1700 = 7200
      expect(res.body.totalRevenue).toBe(7200);
    });

    it('should return correct statusCounts from the ledger', async () => {
      const res = await request(app).get('/api/transactions/summary');
      expect(res.status).toBe(200);
      expect(res.body.statusCounts).toEqual({ Active: 4, Returned: 1 });
    });

    it('should return summary for a specific user when username is provided', async () => {
      const res = await request(app).get('/api/transactions/summary?username=daniel');
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBe(1);
      // 700 * 2 = 1400
      expect(res.body.totalRevenue).toBe(1400);
      expect(res.body.statusCounts).toEqual({ Returned: 1 });
    });

    it('should return zero totals when username matches no records', async () => {
      const res = await request(app).get('/api/transactions/summary?username=nonexistent');
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBe(0);
      expect(res.body.totalRevenue).toBe(0);
      expect(res.body.statusCounts).toEqual({});
    });
  });

  // GET /api/transactions/costs
  describe('GET /api/transactions/costs', () => {
    it('should return cost breakdown for all transactions', async () => {
      const res = await request(app).get('/api/transactions/costs');
      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(5);
      expect(res.body.breakdown.length).toBe(5);
    });

    it('should calculate totalCost as pricePerDay * daysRented for each record', async () => {
      const res = await request(app).get('/api/transactions/costs');
      expect(res.status).toBe(200);
      res.body.breakdown.forEach(item => {
        expect(item.totalCost).toBe(item.pricePerDay * item.daysRented);
      });
    });

    it('should calculate correct aggregate totalCost across all records', async () => {
      const res = await request(app).get('/api/transactions/costs');
      expect(res.status).toBe(200);
      expect(res.body.totalCost).toBe(7200);
    });

    it('should calculate correct averageCostPerItem', async () => {
      const res = await request(app).get('/api/transactions/costs');
      expect(res.status).toBe(200);
      // 7200 / 5 = 1440
      expect(res.body.averageCostPerItem).toBe(1440);
    });

    it('should return cost breakdown for a single transaction by ID', async () => {
      const res = await request(app).get('/api/transactions/costs?transactionId=TX-1001');
      expect(res.status).toBe(200);
      expect(res.body.totalItems).toBe(1);
      expect(res.body.breakdown[0].id).toBe('TX-1001');
      expect(res.body.breakdown[0].totalCost).toBe(1500);
    });

    it('should return 500 when transactionId does not exist', async () => {
      const res = await request(app).get('/api/transactions/costs?transactionId=TX-9999');
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Transaction not found');
    });
  });
});
