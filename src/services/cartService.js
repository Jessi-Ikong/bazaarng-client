import api from './api';

export const getCart = () => api.get('/cart');
export const addItemToCart = (productId, quantity = 1, selectedOptions = {}, offerId) =>
  api.post('/cart/items', { productId, quantity, selectedOptions, ...(offerId && { offerId }) });
// Addressed by the cart item's own _id, not the product id — a product can
// appear as more than one line now (different variant selections).
export const updateCartItem = (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/cart/items/${itemId}`);
