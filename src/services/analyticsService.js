import api from './api';

export const getVendorAnalytics = () => api.get('/analytics/vendor');
export const getAdminAnalytics = () => api.get('/analytics/admin');
