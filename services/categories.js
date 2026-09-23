import api from './api';

export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};
