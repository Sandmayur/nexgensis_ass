import api from './api';

/**
 * Fetches products from the API, supporting search, category filtering, pagination, and sorting.
 * Also supports an AbortController signal to prevent race conditions during fast typing.
 */
export const getProducts = async (params = {}, signal) => {
  const {
    q = '',
    category = '',
    page = 1,
    limit = 10,
    sortBy = '',
    order = ''
  } = params;

  const skip = (page - 1) * limit;

  // DummyJSON endpoint rules:
  // 1. If searching text, use /products/search?q=...
  // 2. If category is selected (and no text search), use /products/category/{category}
  // 3. Otherwise, use /products
  
  let endpoint = '/products';
  if (q) {
    endpoint = `/products/search`;
  } else if (category) {
    endpoint = `/products/category/${category}`;
  }

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString()
  });

  if (q) queryParams.append('q', q);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (order) queryParams.append('order', order);

  const response = await api.get(`${endpoint}?${queryParams.toString()}`, { signal });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products/add', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
