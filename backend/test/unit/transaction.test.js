import { describe, it, expect, vi } from 'vitest';
import transactionService from '../../service/transaction.service';
import transactionModel from '../../model/transaction.model';

vi.mock('../../model/transaction.model', () => {
  return {
    default: {
      findAll: vi.fn(),
      updateStatus: vi.fn(),
      create: vi.fn(),
    },
  };
});

describe('Transaction Service', () => {
  describe('Get Transactions', () => {
    it('should read transactions through the paginated model', async () => {
      transactionModel.findAll.mockResolvedValue({
        data: [{ item: 'Crimson Ballgown', amount: '₱2,000', status: 'Reserved' }],
        total: 1,
        error: null,
      });

      const result = await transactionService.getTransactions();

      expect(result.data.length).toBe(1);
      expect(result.data[0].item).toBe('Crimson Ballgown');
      expect(result.data[0].status).toBe('Reserved');
    });
  });

  describe('Create Transaction', () => {
    describe('Check input validation', () => {
      it('should throw an error if item name is not provided', async () => {
        await expect(transactionService.createTransaction({ amount: 2000, status: 'Reserved' }))
          .rejects
          .toThrow(/Invalid item name or missing fields/i);
      });

      it('should throw an error if amount is missing', async () => {
        await expect(transactionService.createTransaction({ item: 'Crimson Ballgown', status: 'Reserved' }))
          .rejects
          .toThrow(/Transaction amount is required/i);
      });

      it('should throw an error if status is empty spaces', async () => {
        await expect(transactionService.createTransaction({ item: 'Crimson Ballgown', amount: 2000, status: '   ' }))
          .rejects
          .toThrow(/Invalid transaction status/i);
      });
    });

    describe('Successful creation', () => {
      it('should add a new transaction successfully if all inputs are valid', async () => {
        const newTxInput = {
          item: 'Crimson Ballgown',
          amount: 2000,
          status: 'Reserved',
        };

        const mockSavedTx = {
          id: 'TX-1234',
          item: 'Crimson Ballgown',
          date: 'May 10, 2026',
          status: 'Reserved',
          amount: '₱2,000',
        };

        transactionModel.create.mockResolvedValue({ data: [mockSavedTx], error: null });

        const result = await transactionService.createTransaction(newTxInput);

        expect(result.id).toContain('TX-');
        expect(result.item).toBe('Crimson Ballgown');
        expect(result.amount).toBe('₱2,000');
      });
    });
  });
});
