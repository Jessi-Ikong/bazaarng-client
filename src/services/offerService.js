import api from './api';

export const createOffer = (productId, proposedPrice) =>
  api.post('/offers', { productId, proposedPrice });
export const getMyOffers = () => api.get('/offers/mine');
export const acceptCounterOffer = (offerId) => api.put(`/offers/${offerId}/accept-counter`);
export const getVendorOffers = () => api.get('/offers/vendor');
export const respondToOffer = (offerId, action, counterPrice) =>
  api.put(`/offers/${offerId}/respond`, { action, counterPrice });
