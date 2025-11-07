import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacher.controller.js';
import { authenticate, isAdmin, isTeacherOrAdmin } from '../middleware/auth.middleware.js';
import { validate, validateTeacher, validateTeacherUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить всех учителей
router.get('/', getAllTeachers);

// Получить учителя по ID
router.get('/:id', getTeacherById);

// Создать учителя (только админ)
router.post('/', isAdmin, validate(validateTeacher), createTeacher);

// Обновить учителя (только админ и сам учитель)
router.put('/:id', isTeacherOrAdmin, validate(validateTeacherUpdate), updateTeacher);

// Удалить учителя (только админ)
router.delete('/:id', isAdmin, deleteTeacher);

export default router;

