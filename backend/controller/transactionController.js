import transactionService from '../service/transaction.service.js';

// Import your Product model (adjust the path to match your actual model structure)

import product from '../model/product.model.js';



export const getTransactions = async (req, res) => {

  try {

    const page = parseInt(req.query.page, 10) || 1;

    const limit = parseInt(req.query.limit, 10) || 10;

    const { search, status } = req.query;



    const result = await transactionService.getTransactions({

      page,

      limit,

      search: search || '',

      status: status || '',

    });



    res.status(200).json({

      status: 'success',

      message: 'Transactions retrieved successfully',

      data: result.data,

      total: result.total,

      page,

      limit,

      totalPages: Math.ceil(result.total / limit),

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

    const { item } = req.body;



    // 1. Create the transaction using your service layer

    const newTransaction = await transactionService.createTransaction(req.body);



    // 2. Automatically update the corresponding product status to 'Rented'

    try {

      if (item) {

        await product.update(

          { status: 'Rented' },

          { where: { name: item } }

        );

      }

    } catch (statusErr) {

      console.error('Warning: Failed to update product status automatically:', statusErr.message);

    }



    res.status(201).json({

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



export const updateTransactionStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.body;



    const updated = await transactionService.updateTransactionStatus(id, status);

    res.status(200).json({

      status: 'success',

      message: 'Transaction status updated successfully',

      data: updated

    });

  } catch (error) {

    res.status(400).json({

      status: 'error',

      message: error.message || 'Failed to update transaction status'

    });

  }

};



export default {

  getTransactions,

  createTransaction,

  updateTransactionStatus,

};