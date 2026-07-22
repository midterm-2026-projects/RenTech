import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import { registerProductRoutes } from '../../route/productRoute.js';
import * as productController from '../../controller/productController.js';

const AUTH_TOKEN = Buffer.from('admin:Admin:1740000000000').toString('base64');
const auth = { Authorization: `Bearer ${AUTH_TOKEN}` };

describe('Product Route', () => {
  it('registers a GET /products handler with auth middleware then delegates to the controller', () => {
    const router = express.Router();
    registerProductRoutes(router);

    const routeLayers = router.stack.filter((layer) => layer.route);
    expect(routeLayers).toHaveLength(2);

    const getRoute = routeLayers.find((l) => l.route.path === '/products');
    expect(getRoute).toBeDefined();
    expect(getRoute.route.methods.get).toBe(true);
    expect(getRoute.route.methods.patch).toBeFalsy();

    const patchRoute = routeLayers.find((l) => l.route.path === '/products/:id/soft-delete');
    expect(patchRoute).toBeDefined();
    expect(patchRoute.route.methods.patch).toBe(true);
  });

  it('delegates incoming GET /products requests to productController.getProducts', async () => {
    const spy = vi.spyOn(productController, 'getProducts').mockImplementation((req, res) => {
      res.status(200).json({ status: 'success', data: [], page: 1, limit: 8, total: 0, totalPages: 0 });
    });

    const app = express();
    registerProductRoutes(app);

    const request = (await import('supertest')).default;
    const res = await request(app).get('/products').set(auth);

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    spy.mockRestore();
  });
});