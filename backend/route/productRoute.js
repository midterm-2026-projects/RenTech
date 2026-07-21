import * as productController from '../controller/productController.js';

export function registerProductRoutes(router) {
  router.get('/products', productController.getProducts);
  router.patch('/products/:id/soft-delete', productController.softDeleteProduct);
}
