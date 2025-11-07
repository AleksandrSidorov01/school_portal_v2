import api from '../config/api.js';

export const studentService = {
  // Получить информацию о текущем студенте
  getMyInfo: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Получить студента по ID
  getStudentById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data.student;
  },
};

