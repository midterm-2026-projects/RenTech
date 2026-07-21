import productModel from '../model/product.model.js';

export default {
  async getProducts({ page, limit, search, status } = {}) {
    return await productModel.findAll({ page, limit, search, status });
  },
};
