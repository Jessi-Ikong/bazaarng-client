import api from './api';

export const checkout = (shippingAddress, paymentMethod) =>
  api.post('/orders/checkout', { shippingAddress, paymentMethod });
export const getMyOrders = () => api.get('/orders/mine');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getVendorOrders = () => api.get('/orders/vendor');
export const updateOrderStatus = (orderId, status) => api.put(`/orders/${orderId}/status`, { status });
export const initiateDeliveryPayment = (orderId) =>
  api.post(`/orders/${orderId}/initiate-delivery-payment`);
export const retryOrderPayment = (orderId) => api.post(`/orders/${orderId}/retry-payment`);
// responseType 'blob' so axios treats this as binary file data, not JSON
export const downloadReceipt = (orderId) =>
  api.get(`/orders/${orderId}/receipt`, { responseType: 'blob' });

export const verifyPayment = (reference) => api.get(`/payments/verify/${reference}`);
