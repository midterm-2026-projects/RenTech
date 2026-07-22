import { describe, it, expect, vi, beforeEach } from 'vitest';
import transactionService from '../../service/transaction.service.js';
import { createTransaction, getTransactions } from '../../controller/transactionController.js';

vi.mock('../../service/transaction.service.js', () => ({
  default: {
    getTransactions: vi.fn(),
    createTransaction: vi.fn(),
  },
}));

vi.mock('../../model/product.model.js', () => ({
  default: {
    create: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: [], error: null }),
    updateStatusByName: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

vi.mock('../../service/product.service.js', () => ({
  default: {
    updateProductStatusByName: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

describe('Transaction Controller Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET getTransactions', () => {
    it('should return 200 and transactions on success', async () => {
      const payload = [{ id: 'TX-1021', item: 'Crimson Ballgown' }];
      transactionService.getTransactions.mockResolvedValue({ data: payload, total: 1 });

      const req = { query: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: payload
      }));
    });
  });

  describe('POST createTransaction', () => {
    const validBody = {
      item: 'Emerald Evening Gown',
      amount: '₱3,500',
      status: 'Reserved'
    };

    it('should return success response when created', async () => {
      transactionService.createTransaction.mockResolvedValue(validBody);

      const req = { body: validBody };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: validBody
      }));
    });

    it('should return 400 when service throws error', async () => {
      transactionService.createTransaction.mockRejectedValue(new Error('Invalid item name'));

      const req = { body: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid item name'
      });
    });
  });
});