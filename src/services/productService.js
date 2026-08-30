import api from './api';

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const getMyProducts = () => api.get('/products/mine');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  // Don't set Content-Type manually — the browser needs to set the
  // multipart boundary itself, which it only does if left alone.
  return api.post('/products/upload-image', formData);
};

export const getCategories = () => api.get('/categories');
