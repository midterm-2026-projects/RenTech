import { describe, it, expect, vi, beforeEach } from 'vitest';
import transactionService from '../../service/transaction.service.js';
import transactionModel from '../../model/transaction.model.js';

vi.mock('../../model/transaction.model.js', () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
  },
}));

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should call transactionModel.find and return results', async () => {
      const mockData = [{ id: 'TX-1021', item: 'Test Gown' }];
      transactionModel.find.mockResolvedValue(mockData);

      const result = await transactionService.getTransactions();

      expect(transactionModel.find).toHaveBeenCalled();
      expect(result).toBe(mockData);
    });
  });

  describe('createTransaction', () => {
    it('should successfully create a transaction when data is valid', async () => {
      const txData = { item: 'Silk Gown', amount: 2000, status: 'Reserved' };
      transactionModel.create.mockResolvedValue({ id: 'TX-1234', ...txData });

      const result = await transactionService.createTransaction(txData);

      expect(transactionModel.create).toHaveBeenCalledWith(txData);
      expect(result.id).toBe('TX-1234');
    });

    it('should throw an error if item name is missing or empty', async () => {
      const invalidData = { item: ' ', amount: 2000 };
      
      await expect(transactionService.createTransaction(invalidData))
        .rejects.toThrow('Invalid item name or missing fields');
    });

    it('should throw an error if amount is missing', async () => {
      const invalidData = { item: 'Silk Gown' };
      
      await expect(transactionService.createTransaction(invalidData))
        .rejects.toThrow('Transaction amount is required');
    });

    it('should throw an error if status is an empty string', async () => {
      const invalidData = { item: 'Silk Gown', amount: 2000, status: ' ' };
      
      await expect(transactionService.createTransaction(invalidData))
        .rejects.toThrow('Invalid transaction status');
    });
  });
});