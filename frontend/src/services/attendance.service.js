import api from '../config/api.js';

export const attendanceService = {
  // Получить всю посещаемость
  getAllAttendances: async (params = {}) => {
    const response = await api.get('/attendances', { params });
    return response.data.attendances;
  },

  // Получить посещаемость по ID
  getAttendanceById: async (id) => {
    const response = await api.get(`/attendances/${id}`);
    return response.data.attendance;
  },

  // Создать запись о посещаемости
  createAttendance: async (data) => {
    const response = await api.post('/attendances', data);
    return response.data.attendance;
  },

  // Создать записи о посещаемости для всего класса
  createAttendancesForClass: async (data) => {
    const response = await api.post('/attendances/class', data);
    return response.data;
  },

  // Обновить запись о посещаемости
  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendances/${id}`, data);
    return response.data.attendance;
  },

  // Удалить запись о посещаемости
  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendances/${id}`);
    return response.data;
  },

  // Получить статистику посещаемости для ученика
  getStudentStats: async (studentId, params = {}) => {
    const response = await api.get(`/attendances/student/${studentId}/stats`, { params });
    return response.data.stats;
  },
};

