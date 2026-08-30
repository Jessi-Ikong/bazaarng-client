import api from './api';

export const getOrCreateConversation = (payload) => api.post('/chat/conversations', payload);
export const getMyConversations = () => api.get('/chat/conversations');
export const getUnreadCount = () => api.get('/chat/unread-count');
export const getMessages = (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, content, replyToMessageId) =>
  api.post(`/chat/conversations/${conversationId}/messages`, { content, replyToMessageId });
export const editMessage = (conversationId, messageId, content) =>
  api.patch(`/chat/conversations/${conversationId}/messages/${messageId}`, { content });
export const deleteMessage = (conversationId, messageId) =>
  api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
export const markDelivered = (conversationId, messageIds) =>
  api.post(`/chat/conversations/${conversationId}/mark-delivered`, { messageIds });
export const markRead = (conversationId) => api.post(`/chat/conversations/${conversationId}/mark-read`);
