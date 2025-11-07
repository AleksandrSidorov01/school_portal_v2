import api from '../config/api.js';

export const notificationService = {
  // Получить все уведомления пользователя
  getMyNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data.notifications;
  },

  // Получить количество непрочитанных уведомлений
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  // Отметить уведомление как прочитанное
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Отметить все как прочитанные
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Удалить уведомление
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

