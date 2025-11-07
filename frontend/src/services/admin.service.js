import api from '../config/api.js';

export const adminService = {
  // Получить статистику системы
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data.statistics;
  },

  // Получить всех пользователей
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data.users;
  },

  // Создать пользователя
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Обновить пользователя
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Удалить пользователя
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Получить все предметы
  getAllSubjects: async () => {
    const response = await api.get('/admin/subjects');
    return response.data.subjects;
  },

  // Создать предмет
  createSubject: async (subjectData) => {
    const response = await api.post('/admin/subjects', subjectData);
    return response.data;
  },

  // Удалить предмет
  deleteSubject: async (subjectId) => {
    const response = await api.delete(`/admin/subjects/${subjectId}`);
    return response.data;
  },
};

