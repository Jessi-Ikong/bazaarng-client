import api from './api';

export const getMyVendorProfile = () => api.get('/vendors/me');
export const updateMyVendorProfile = (data) => api.put('/vendors/me', data);
