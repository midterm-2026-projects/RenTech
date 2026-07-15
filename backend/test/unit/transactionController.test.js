import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerTransactionRoutes } from '../../route/transactionRoute.js';
import transactionService from '../../service/transaction.service.js';

// Mock the service layer
vi.mock('../../service/transaction.service.js', () => ({
  default: {
    getTransactions: vi.fn(),
    createTransaction: vi.fn(),
  },
}));

// Setup a minimal Express app for Supertest
const app = express();
app.use(express.json());
const router = express.Router();
registerTransactionRoutes(router);
app.use('/', router); 

describe('Transaction Controller (Supertest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /transactions', () => {
    it('should return 200 and success status with transaction list', async () => {
      const payload = [{ id: 'TX-1021', item: 'Crimson Ballgown', amount: '₱2,000' }];
      transactionService.getTransactions.mockResolvedValue(payload);

      const response = await request(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Transactions retrieved successfully',
        data: payload
      });
    });

    // Test case for handling empty transaction database state
    it('should return 200 and empty data when there are no transactions', async () => {
      transactionService.getTransactions.mockResolvedValue([]);

      const response = await request(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Transactions retrieved successfully',
        data: []
      });
    });
  });

  describe('POST /transactions', () => {
    const validBody = {
      item: 'Emerald Evening Gown',
      amount: '₱3,500',
      status: 'Reserved'
    };

    it('should return 200 when transaction is created successfully', async () => {
      transactionService.createTransaction.mockResolvedValue(validBody);

      const response = await request(app)
        .post('/transactions')
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Transaction created successfully',
        data: validBody
      });
    });

    it('should return 400 when service layer throws an error', async () => {
      transactionService.createTransaction.mockRejectedValue(new Error('Invalid item name'));

      const response = await request(app)
        .post('/transactions')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid item name'
      });
    });
  });
});