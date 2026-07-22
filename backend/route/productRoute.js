import * as productController from '../controller/productController.js';
import { requireAuth } from '../middleware/auth.js';

export function registerProductRoutes(router) {
  router.get('/products', requireAuth, productController.getProducts);
  router.patch('/products/:id/soft-delete', requireAuth, productController.softDeleteProduct);
}
