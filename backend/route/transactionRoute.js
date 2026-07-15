import { validateRequest } from '../middleware/requestValidator.js';
import * as transactionController from '../controller/transactionController.js';

export function registerTransactionRoutes(router) {
  router.get('/transactions', transactionController.getTransactions);

  router.post(
    '/transactions',
    transactionController.createTransaction
  );
}