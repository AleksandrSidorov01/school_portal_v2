// Клиентская валидация форм

export const validateEmail = (email) => {
  if (!email) return 'Email обязателен';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Некорректный email';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Пароль обязателен';
  if (password.length < 6) return 'Пароль должен содержать минимум 6 символов';
  return '';
};

export const validateRequired = (value, fieldName = 'Поле') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} обязательно`;
  }
  return '';
};

export const validateNumber = (value, min, max, fieldName = 'Число') => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} обязательно`;
  }
  const num = parseInt(value);
  if (isNaN(num)) return `${fieldName} должно быть числом`;
  if (min !== undefined && num < min) return `${fieldName} должно быть не менее ${min}`;
  if (max !== undefined && num > max) return `${fieldName} должно быть не более ${max}`;
  return '';
};

export const validateDate = (date, fieldName = 'Дата') => {
  if (!date) return `${fieldName} обязательна`;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Некорректная дата';
  return '';
};

export const validateUserForm = (data) => {
  const errors = {};

  errors.email = validateEmail(data.email);
  if (data.password) {
    errors.password = validatePassword(data.password);
  }
  errors.firstName = validateRequired(data.firstName, 'Имя');
  errors.lastName = validateRequired(data.lastName, 'Фамилия');

  return {
    isValid: Object.values(errors).every(err => err === ''),
    errors,
  };
};

export const validateClassForm = (data) => {
  const errors = {};

  errors.name = validateRequired(data.name, 'Название класса');
  errors.grade = validateNumber(data.grade, 1, 11, 'Класс');

  return {
    isValid: Object.values(errors).every(err => err === ''),
    errors,
  };
};

export const validateSubjectForm = (data) => {
  const errors = {};

  errors.name = validateRequired(data.name, 'Название предмета');

  return {
    isValid: Object.values(errors).every(err => err === ''),
    errors,
  };
};

export const validateGradeForm = (data) => {
  const errors = {};

  errors.studentId = validateRequired(data.studentId, 'Ученик');
  errors.subjectId = validateRequired(data.subjectId, 'Предмет');
  errors.value = validateNumber(data.value, 2, 5, 'Оценка');
  errors.date = validateDate(data.date, 'Дата');

  return {
    isValid: Object.values(errors).every(err => err === ''),
    errors,
  };
};

export const validateScheduleForm = (data) => {
  const errors = {};

  errors.classId = validateRequired(data.classId, 'Класс');
  errors.subjectId = validateRequired(data.subjectId, 'Предмет');
  errors.teacherId = validateRequired(data.teacherId, 'Учитель');
  errors.dayOfWeek = validateNumber(data.dayOfWeek, 1, 7, 'День недели');
  errors.lessonNumber = validateNumber(data.lessonNumber, 1, 8, 'Номер урока');

  return {
    isValid: Object.values(errors).every(err => err === ''),
    errors,
  };
};

