import productService from '../service/product.service.js';

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const { search, status } = req.query;

    const { data, total, error } = await productService.getProducts({
      page,
      limit,
      search: search || '',
      status: status || '',
    });

    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }

    res.json({
      status: 'success',
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export default { getProducts };
