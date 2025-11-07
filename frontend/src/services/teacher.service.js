import api from '../config/api.js';

export const teacherService = {
  // Получить информацию о текущем учителе
  getMyInfo: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Получить учителя по ID
  getTeacherById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data.teacher;
  },

  // Получить все классы
  getAllClasses: async () => {
    const response = await api.get('/classes');
    return response.data.classes;
  },

  // Получить все предметы учителя
  getMySubjects: async () => {
    const userInfo = await teacherService.getMyInfo();
    if (userInfo.teacher && userInfo.teacher.subjects) {
      return userInfo.teacher.subjects;
    }
    return [];
  },

  // Получить всех учителей (для админа)
  getAllTeachers: async () => {
    const response = await api.get('/teachers');
    return response.data.teachers;
  },
};

