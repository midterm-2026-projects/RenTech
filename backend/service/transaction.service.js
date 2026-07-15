import transactionModel from '../model/transaction.model.js'; 

export default {
  async getTransactions() {
    return await transactionModel.find();
  },

  async createTransaction(txData) {
    if (!txData.item || txData.item.trim() === "") {
      throw new Error('Invalid item name or missing fields');
    }
    
    if (!txData.amount) {
      throw new Error('Transaction amount is required');
    }

    if (txData.status && txData.status.trim() === "") {
      throw new Error('Invalid transaction status');
    }

    return await transactionModel.create(txData);
  }
};