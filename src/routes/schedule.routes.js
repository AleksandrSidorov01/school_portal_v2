import express from 'express';
import {
  getAllSchedules,
  getClassSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller.js';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth.middleware.js';
import { validate, validateSchedule } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить все расписание
router.get('/', getAllSchedules);

// Получить расписание класса
router.get('/class/:classId', getClassSchedule);

// Получить расписание по ID
router.get('/:id', getScheduleById);

// Создать запись в расписании (только админ и учитель)
router.post('/', isTeacherOrAdmin, validate(validateSchedule), createSchedule);

// Обновить расписание (только админ и учитель)
router.put('/:id', isTeacherOrAdmin, validate(validateSchedule), updateSchedule);

// Удалить запись из расписания (только админ и учитель)
router.delete('/:id', isTeacherOrAdmin, deleteSchedule);

export default router;

