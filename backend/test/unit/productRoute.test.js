import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import { registerProductRoutes } from '../../route/productRoute.js';
import * as productController from '../../controller/productController.js';

describe('Product Route', () => {
  it('registers a GET /products handler that delegates to the controller', () => {
    const router = express.Router();
    registerProductRoutes(router);

    // The router should expose exactly one layer with a route.
    const routeLayers = router.stack.filter((layer) => layer.route);
    expect(routeLayers).toHaveLength(1);

    const route = routeLayers[0].route;
    expect(route.path).toBe('/products');
    expect(route.methods.get).toBe(true);
    expect(route.methods.post).toBeFalsy();
    expect(route.stack[0].handle).toBe(productController.getProducts);
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
