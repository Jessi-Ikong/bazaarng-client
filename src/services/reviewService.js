import api from './api';

export const getProductReviews = (productId) => api.get(`/reviews/product/${productId}`);
export const getVendorReviews = (vendorId) => api.get(`/reviews/vendor/${vendorId}`);
export const getReviewEligibility = (productId) => api.get(`/reviews/eligibility/${productId}`);
export const createReview = (productId, rating, comment) =>
  api.post('/reviews', { productId, rating, comment });
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
