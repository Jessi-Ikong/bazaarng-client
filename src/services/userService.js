import api from './api';

export const getMe = () => api.get('/auth/me');
export const updateMyProfile = (data) => api.put('/users/me', data);
