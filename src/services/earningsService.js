import api from './api';

export const getVendorEarnings = () => api.get('/earnings/vendor');
