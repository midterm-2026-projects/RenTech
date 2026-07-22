import { describe, it, expect, vi, beforeEach } from 'vitest';
import productService from '../../service/product.service.js';
import productModel from '../../model/product.model.js';

vi.mock('../../model/product.model.js', () => ({
  default: { 
    findAll: vi.fn(), 
    updateStatusByName: vi.fn(),
    softDeleteProduct: vi.fn() 
  },
}));

describe('Product Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates getProducts to the product model and returns its result', async () => {
    const mockResult = {
      data: [{ id: 1, name: 'Ivory Lace Gown', status: 'Available' }],
      total: 1,
      error: null,
    };
    productModel.findAll.mockResolvedValue(mockResult);

    const filters = { page: 2, limit: 8, search: 'gown', status: 'Available' };
    const result = await productService.getProducts(filters);

    expect(productModel.findAll).toHaveBeenCalledWith(filters);
    expect(result).toBe(mockResult);
  });

  it('works with default (empty) filters', async () => {
    const mockResult = { data: [], total: 0, error: null };
    productModel.findAll.mockResolvedValue(mockResult);

    const result = await productService.getProducts();

    expect(productModel.findAll).toHaveBeenCalledWith({});
    expect(result).toBe(mockResult);
  });

  it('delegates softDeleteProduct to the product model with the id', async () => {
    const mockResult = { data: { id: 1 }, error: null };
    productModel.softDeleteProduct.mockResolvedValue(mockResult);

    const result = await productService.softDeleteProduct(1);

    expect(productModel.softDeleteProduct).toHaveBeenCalledWith(1);
    expect(result).toBe(mockResult);
  });
});