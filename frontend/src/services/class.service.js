import api from '../config/api.js';

export const classService = {
  // Получить все классы
  getAllClasses: async () => {
    const response = await api.get('/classes');
    return response.data.classes;
  },

  // Получить класс по ID
  getClassById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data.class;
  },

  // Получить всех учеников класса
  getClassStudents: async (classId) => {
    const response = await api.get(`/students?classId=${classId}`);
    return response.data.students;
  },
};

