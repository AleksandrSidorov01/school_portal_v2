import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller.js';
import { authenticate, isAdmin, isTeacherOrAdmin } from '../middleware/auth.middleware.js';
import { validate, validateStudent, validateStudentUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить всех учеников
router.get('/', getAllStudents);

// Получить ученика по ID
router.get('/:id', getStudentById);

// Создать ученика (только админ и учитель)
router.post('/', isTeacherOrAdmin, validate(validateStudent), createStudent);

// Обновить ученика (только админ и учитель)
router.put('/:id', isTeacherOrAdmin, validate(validateStudentUpdate), updateStudent);

// Удалить ученика (только админ)
router.delete('/:id', isAdmin, deleteStudent);

export default router;

