import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerProductRoutes } from '../../route/productRoute.js';
import productService from '../../service/product.service.js';

vi.mock('../../service/product.service.js', () => ({
  default: {
    getProducts: vi.fn(),
    softDeleteProduct: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
const router = express.Router();
registerProductRoutes(router);
app.use('/', router);

describe('Product Controller (Supertest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /products', () => {
    it('returns 200 with a paginated success envelope and default params', async () => {
      const payload = [
        { id: 1, name: 'Ivory Lace Gown', status: 'Available' },
        { id: 2, name: 'Black Tuxedo', status: 'Rented' },
      ];
      productService.getProducts.mockResolvedValue({ data: payload, total: 2, error: null });

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: payload,
        page: 1,
        limit: 8,
        total: 2,
        totalPages: 1,
      });
      expect(productService.getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 8,
        search: '',
        status: '',
      });
    });

    it('forwards page, limit, search and status query params to the service', async () => {
      productService.getProducts.mockResolvedValue({ data: [], total: 0, error: null });

      await request(app).get('/products?page=3&limit=4&search=gown&status=Available');

      expect(productService.getProducts).toHaveBeenCalledWith({
        page: 3,
        limit: 4,
        search: 'gown',
        status: 'Available',
      });
    });

    it('computes totalPages correctly from the total count', async () => {
      productService.getProducts.mockResolvedValue({ data: [], total: 25, error: null });

      const response = await request(app).get('/products?limit=8');

      expect(response.status).toBe(200);
      expect(response.body.totalPages).toBe(4);
    });

    it('returns 500 when the service reports an error', async () => {
      productService.getProducts.mockResolvedValue({
        data: [],
        total: 0,
        error: new Error('Supabase not configured'),
      });

      const response = await request(app).get('/products');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Supabase not configured',
      });
    });

    it('returns 500 when the service throws', async () => {
      productService.getProducts.mockRejectedValue(new Error('boom'));

      const response = await request(app).get('/products');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'boom' });
    });
  });

  describe('PATCH /products/:id/soft-delete', () => {
    it('returns a success envelope when the service succeeds', async () => {
      productService.softDeleteProduct.mockResolvedValue({ data: { id: 1 }, error: null });

      const response = await request(app).patch('/products/1/soft-delete');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'success', message: 'Product deleted' });
      expect(productService.softDeleteProduct).toHaveBeenCalledWith('1');
    });

    it('returns 500 when the service reports an error', async () => {
      productService.softDeleteProduct.mockResolvedValue({ data: null, error: new Error('nope') });

      const response = await request(app).patch('/products/1/soft-delete');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'nope' });
    });

    it('returns 500 when the service throws', async () => {
      productService.softDeleteProduct.mockRejectedValue(new Error('boom'));

      const response = await request(app).patch('/products/1/soft-delete');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ status: 'error', message: 'boom' });
    });
  });
});
