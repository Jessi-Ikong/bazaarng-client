import api from './api';

export const getPublicVendorProfile = (vendorId) => api.get(`/vendors/${vendorId}/public`);
