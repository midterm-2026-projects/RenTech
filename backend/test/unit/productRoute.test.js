import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import { registerProductRoutes } from '../../route/productRoute.js';
import * as productController from '../../controller/productController.js';

describe('Product Route', () => {
  it('registers a GET /products handler that delegates to the controller', () => {
    const router = express.Router();
    registerProductRoutes(router);

    // The router should expose exactly the expected routes.
    const routeLayers = router.stack.filter((layer) => layer.route);
    expect(routeLayers).toHaveLength(2);

    const getRoute = routeLayers.find((l) => l.route.path === '/products');
    expect(getRoute).toBeDefined();
    expect(getRoute.route.methods.get).toBe(true);
    expect(getRoute.route.methods.patch).toBeFalsy();
    expect(getRoute.route.stack[0].handle).toBe(productController.getProducts);

    const patchRoute = routeLayers.find((l) => l.route.path === '/products/:id/soft-delete');
    expect(patchRoute).toBeDefined();
    expect(patchRoute.route.methods.patch).toBe(true);
    expect(patchRoute.route.stack[0].handle).toBe(productController.softDeleteProduct);
  });

  it('delegates incoming GET /products requests to productController.getProducts', async () => {
    const spy = vi.spyOn(productController, 'getProducts').mockImplementation((req, res) => {
      res.status(200).json({ status: 'success', data: [], page: 1, limit: 8, total: 0, totalPages: 0 });
    });

    const app = express();
    registerProductRoutes(app);

    const request = (await import('supertest')).default;
    const res = await request(app).get('/products');

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    spy.mockRestore();
  });
});
