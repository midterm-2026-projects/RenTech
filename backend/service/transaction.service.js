import transactionModel from '../model/transaction.model.js';

// Normalize any incoming date to a canonical "YYYY-MM-DD" string so the
// transactions.date column stays consistent regardless of input format.
function normalizeDate(raw) {
  const parsed = raw ? new Date(raw) : new Date();
  if (isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function buildTransaction(txData) {
  return {
    id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
    username: txData.username || 'Walk-in Customer',
    item: txData.item,
    price_per_day: txData.pricePerDay != null ? txData.pricePerDay : txData.amount,
    days_rented: txData.daysRented != null ? txData.daysRented : 1,
    amount: txData.amount,
    date: normalizeDate(txData.date),
    status: txData.status || 'Reserved',
  };
}

export default {
  async getTransactions({ page, limit, search, status } = {}) {
    return await transactionModel.findAll({ page, limit, search, status });
  },

  async updateTransactionStatus(id, status) {
    if (!id) throw new Error('Transaction id is required');
    if (!status || status.trim() === '') throw new Error('Transaction status is required');
    return await transactionModel.updateStatus(id, status.trim());
  },

  async createTransaction(txData) {
    if (!txData.item || txData.item.trim() === '') {
      throw new Error('Invalid item name or missing fields');
    }
    if (!txData.amount) {
      throw new Error('Transaction amount is required');
    }
    if (txData.status && txData.status.trim() === '') {
      throw new Error('Invalid transaction status');
    }

    const formattedTransaction = buildTransaction(txData);

    const { data, error } = await transactionModel.create(formattedTransaction);
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? data[0] : data;
  },
};
