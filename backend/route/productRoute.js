import * as productController from '../controller/productController.js';

export function registerProductRoutes(router) {
  router.get('/products', productController.getProducts);
}
