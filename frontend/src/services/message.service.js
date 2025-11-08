import api from '../config/api.js';

export const messageService = {
  // Получить все сообщения
  getAllMessages: async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data.messages;
  },

  // Получить сообщение по ID
  getMessageById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data.message;
  },

  // Получить диалог с пользователем
  getConversation: async (userId) => {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data.messages;
  },

  // Получить список диалогов
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data.conversations;
  },

  // Создать сообщение
  createMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data.data;
  },

  // Обновить сообщение
  updateMessage: async (id, data) => {
    const response = await api.put(`/messages/${id}`, data);
    return response.data.data;
  },

  // Удалить сообщение
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  // Отметить сообщение как прочитанное
  markAsRead: async (id) => {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data.data;
  },

  // Получить количество непрочитанных сообщений
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data.count;
  },
};

