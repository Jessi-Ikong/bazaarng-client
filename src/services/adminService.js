import api from './api';

// Vendors
export const getPendingVendors = () => api.get('/vendors/pending');
export const getAllVendors = () => api.get('/vendors/all');
export const updateVendorStatus = (vendorId, status) =>
  api.put(`/vendors/${vendorId}/status`, { status });

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Products
export const getAllProductsAdmin = () => api.get('/products/admin/all');
export const adminUpdateProductStatus = (productId, status) =>
  api.put(`/products/${productId}/admin-status`, { status });

// Orders
export const getAllOrdersAdmin = () => api.get('/orders/admin/all');

// Promo slides
export const getAllPromoSlidesAdmin = () => api.get('/promo-slides/admin/all');
export const createPromoSlide = (data) => api.post('/promo-slides', data);
export const updatePromoSlide = (id, data) => api.put(`/promo-slides/${id}`, data);
export const deletePromoSlide = (id) => api.delete(`/promo-slides/${id}`);
