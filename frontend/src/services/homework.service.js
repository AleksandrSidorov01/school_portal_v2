import api from '../config/api.js';

export const homeworkService = {
  // Получить все домашние задания
  getAllHomeworks: async (params = {}) => {
    const response = await api.get('/homeworks', { params });
    return response.data.homeworks;
  },

  // Получить домашнее задание по ID
  getHomeworkById: async (id) => {
    const response = await api.get(`/homeworks/${id}`);
    return response.data.homework;
  },

  // Создать домашнее задание
  createHomework: async (data) => {
    const response = await api.post('/homeworks', data);
    return response.data.homework;
  },

  // Обновить домашнее задание
  updateHomework: async (id, data) => {
    const response = await api.put(`/homeworks/${id}`, data);
    return response.data.homework;
  },

  // Удалить домашнее задание
  deleteHomework: async (id) => {
    const response = await api.delete(`/homeworks/${id}`);
    return response.data;
  },

  // Отметить задание как выполненное
  markAsCompleted: async (id) => {
    const response = await api.patch(`/homeworks/${id}/complete`);
    return response.data.homework;
  },

  // Получить статистику выполнения задания
  getCompletionStats: async (id) => {
    const response = await api.get(`/homeworks/${id}/completion-stats`);
    return response.data;
  },
};

