import api from '../config/api.js';

export const parentService = {
  // Получить информацию о текущем родителе
  getMyInfo: async () => {
    const response = await api.get('/parents/me');
    return response.data.parent;
  },

  // Получить всех родителей
  getAllParents: async () => {
    const response = await api.get('/parents');
    return response.data.parents;
  },

  // Получить родителя по ID
  getParentById: async (id) => {
    const response = await api.get(`/parents/${id}`);
    return response.data.parent;
  },

  // Создать родителя
  createParent: async (data) => {
    const response = await api.post('/parents', data);
    return response.data.parent;
  },

  // Обновить родителя
  updateParent: async (id, data) => {
    const response = await api.put(`/parents/${id}`, data);
    return response.data.parent;
  },

  // Удалить родителя
  deleteParent: async (id) => {
    const response = await api.delete(`/parents/${id}`);
    return response.data;
  },

  // Добавить ученика к родителю
  addStudent: async (parentId, studentId) => {
    const response = await api.post(`/parents/${parentId}/students`, { studentId });
    return response.data.parent;
  },

  // Удалить ученика у родителя
  removeStudent: async (parentId, studentId) => {
    const response = await api.delete(`/parents/${parentId}/students/${studentId}`);
    return response.data.parent;
  },
};

