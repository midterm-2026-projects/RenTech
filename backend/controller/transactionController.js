import transactionService from '../service/transaction.service.js';

export const getTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions();
    res.status(200).json({
      status: 'success',
      message: 'Transactions retrieved successfully',
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve transactions'
    });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const newTransaction = await transactionService.createTransaction(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Transaction created successfully',
      data: newTransaction
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create transaction'
    });
  }
};