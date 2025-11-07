import Joi from 'joi';

// Валидация регистрации
export const validateRegister = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    // Роль всегда STUDENT при регистрации, админов создаем через скрипт
  });

  return schema.validate(data);
};

// Валидация входа
export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

// Валидация класса
export const validateClass = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    grade: Joi.number().integer().min(1).max(11).required(),
    description: Joi.string().optional().allow(''),
    classTeacherId: Joi.string().uuid().optional().allow(null, ''),
  });

  return schema.validate(data);
};

// Валидация ученика (для создания)
export const validateStudent = (data) => {
  const schema = Joi.object({
    userId: Joi.string().uuid().required(),
    classId: Joi.string().uuid().required(),
    studentNumber: Joi.string().optional(),
    birthDate: Joi.date().optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Валидация ученика (для обновления)
export const validateStudentUpdate = (data) => {
  const schema = Joi.object({
    classId: Joi.string().uuid().optional(),
    studentNumber: Joi.string().optional(),
    birthDate: Joi.date().optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Валидация учителя (для создания)
export const validateTeacher = (data) => {
  const schema = Joi.object({
    userId: Joi.string().uuid().required(),
    employeeNumber: Joi.string().optional(),
    specialization: Joi.string().optional(),
    phone: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Валидация учителя (для обновления)
export const validateTeacherUpdate = (data) => {
  const schema = Joi.object({
    employeeNumber: Joi.string().optional(),
    specialization: Joi.string().optional(),
    phone: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Валидация оценки (для создания)
export const validateGrade = (data) => {
  const schema = Joi.object({
    studentId: Joi.string().uuid().required().messages({
      'string.guid': 'ID ученика должен быть валидным UUID',
      'any.required': 'Ученик обязателен',
    }),
    subjectId: Joi.string().uuid().required().messages({
      'string.guid': 'ID предмета должен быть валидным UUID',
      'any.required': 'Предмет обязателен',
    }),
    value: Joi.number().integer().min(2).max(5).required().messages({
      'number.base': 'Оценка должна быть числом',
      'number.integer': 'Оценка должна быть целым числом',
      'number.min': 'Оценка должна быть не менее 2',
      'number.max': 'Оценка должна быть не более 5',
      'any.required': 'Оценка обязательна',
    }),
    comment: Joi.string().allow('').optional(),
    date: Joi.date().optional().messages({
      'date.base': 'Дата должна быть валидной',
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

// Валидация оценки (для обновления)
export const validateGradeUpdate = (data) => {
  const schema = Joi.object({
    value: Joi.number().integer().min(2).max(5).optional(),
    comment: Joi.string().optional().allow(''),
    date: Joi.date().optional(),
  });

  return schema.validate(data);
};

// Валидация расписания
export const validateSchedule = (data) => {
  const schema = Joi.object({
    classId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
    teacherId: Joi.string().uuid().required(),
    dayOfWeek: Joi.number().integer().min(1).max(7).required(),
    lessonNumber: Joi.number().integer().min(1).max(10).required(),
    room: Joi.string().optional(),
  });

  return schema.validate(data);
};

// Middleware для валидации
export const validate = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.body);
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors: errorMessages,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req.validatedData = value;
    next();
  };
};

