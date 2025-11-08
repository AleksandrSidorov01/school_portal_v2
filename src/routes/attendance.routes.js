import express from 'express';
import {
  getAllAttendances,
  getAttendanceById,
  createAttendance,
  createAttendancesForClass,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats,
} from '../controllers/attendance.controller.js';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth.middleware.js';
import { validate, validateAttendance, validateAttendanceUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить всю посещаемость
router.get('/', getAllAttendances);

// Получить статистику посещаемости для ученика
router.get('/student/:studentId/stats', getStudentAttendanceStats);

// Получить посещаемость по ID
router.get('/:id', getAttendanceById);

// Создать запись о посещаемости (только учитель или админ)
router.post('/', isTeacherOrAdmin, validate(validateAttendance), createAttendance);

// Создать записи о посещаемости для всего класса (только учитель или админ)
router.post('/class', isTeacherOrAdmin, createAttendancesForClass);

// Обновить запись о посещаемости (только учитель или админ)
router.put('/:id', isTeacherOrAdmin, validate(validateAttendanceUpdate), updateAttendance);

// Удалить запись о посещаемости (только учитель или админ)
router.delete('/:id', isTeacherOrAdmin, deleteAttendance);

export default router;

