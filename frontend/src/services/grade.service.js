import api from '../config/api.js';

export const gradeService = {
  // Получить все оценки текущего студента
  getMyGrades: async () => {
    try {
      // Сначала получаем информацию о пользователе
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data.user;
      
      // Если у пользователя есть профиль студента
      if (user.student && user.student.id) {
        const gradesResponse = await api.get(`/grades/student/${user.student.id}`);
        return gradesResponse.data.grades || [];
      }
      
      // Если нет профиля студента, но пользователь - студент, получаем оценки через фильтр
      if (user.role === 'STUDENT') {
        // Попробуем получить через список всех оценок с фильтром по userId
        // Но для этого нужно сначала найти studentId по userId
        const studentsResponse = await api.get('/students');
        const myStudent = studentsResponse.data.students?.find(
          s => s.userId === user.id
        );
        
        if (myStudent) {
          const gradesResponse = await api.get(`/grades/student/${myStudent.id}`);
          return gradesResponse.data.grades || [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка получения оценок:', error);
      return [];
    }
  },

  // Получить оценки по studentId
  getStudentGrades: async (studentId) => {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data.grades;
  },

  // Получить все оценки (для фильтрации)
  getAllGrades: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.teacherId) params.append('teacherId', filters.teacherId);
    if (filters.studentId) params.append('studentId', filters.studentId);
    
    const response = await api.get(`/grades?${params.toString()}`);
    return response.data.grades;
  },

  // Создать оценку
  createGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  // Обновить оценку
  updateGrade: async (id, gradeData) => {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  },

  // Удалить оценку
  deleteGrade: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  // Получить оценку по ID
  getGradeById: async (id) => {
    const response = await api.get(`/grades/${id}`);
    return response.data.grade;
  },
};

