import { describe, it, expect, vi, beforeEach } from 'vitest';
import transactionService from '../../service/transaction.service.js';
import transactionModel from '../../model/transaction.model.js';

vi.mock('../../model/transaction.model.js', () => ({
  default: {
    findAll: vi.fn(),
    updateStatus: vi.fn(),
    create: vi.fn(),
  },
}));

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should call transactionModel.findAll and return its result', async () => {
      const mockResult = { data: [{ id: 'TX-1021', item: 'Test Gown' }], total: 1, error: null };
      transactionModel.findAll.mockResolvedValue(mockResult);

      const result = await transactionService.getTransactions();

      expect(transactionModel.findAll).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });
  });

  describe('updateTransactionStatus', () => {
    it('should delegate to transactionModel.updateStatus', async () => {
      const mockResult = { data: { id: 'TX-1021', status: 'Returned' }, error: null };
      transactionModel.updateStatus.mockResolvedValue(mockResult);

      const result = await transactionService.updateTransactionStatus('TX-1021', 'Returned');

      expect(transactionModel.updateStatus).toHaveBeenCalledWith('TX-1021', 'Returned');
      expect(result).toBe(mockResult);
    });

    it('should throw if id is missing', async () => {
      await expect(transactionService.updateTransactionStatus('', 'Returned'))
        .rejects.toThrow('Transaction id is required');
    });
  });

  describe('createTransaction', () => {
    it('should successfully create a transaction when data is valid', async () => {
      const txData = { item: 'Silk Gown', amount: 2000, status: 'Reserved' };
      transactionModel.create.mockResolvedValue({ data: [{ id: 'TX-1234', ...txData }], error: null });

      const result = await transactionService.createTransaction(txData);

      expect(transactionModel.create).toHaveBeenCalled();
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
