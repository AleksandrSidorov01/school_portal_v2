import api from '../config/api.js';

export const scheduleService = {
  // Получить расписание текущего студента
  getMySchedule: async () => {
    try {
      // Сначала получаем информацию о пользователе
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data.user;
      
      // Если у пользователя есть профиль студента с классом
      if (user.student && user.student.classId) {
        const scheduleResponse = await api.get(`/schedule/class/${user.student.classId}`);
        return scheduleResponse.data.schedules || [];
      }
      
      // Если нет профиля студента, но пользователь - студент, получаем через список студентов
      if (user.role === 'STUDENT') {
        const studentsResponse = await api.get('/students');
        const myStudent = studentsResponse.data.students?.find(
          s => s.userId === user.id
        );
        
        if (myStudent && myStudent.classId) {
          const scheduleResponse = await api.get(`/schedule/class/${myStudent.classId}`);
          return scheduleResponse.data.schedules || [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка получения расписания:', error);
      return [];
    }
  },

  // Получить расписание класса
  getClassSchedule: async (classId) => {
    const response = await api.get(`/schedule/class/${classId}`);
    return response.data.schedules;
  },

  // Получить все расписание (для фильтрации)
  getAllSchedules: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.classId) params.append('classId', filters.classId);
    if (filters.teacherId) params.append('teacherId', filters.teacherId);
    if (filters.dayOfWeek) params.append('dayOfWeek', filters.dayOfWeek);
    
    const response = await api.get(`/schedule?${params.toString()}`);
    return response.data.schedules;
  },
};

