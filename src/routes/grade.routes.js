import express from 'express';
import {
  getAllGrades,
  getGradeById,
  getStudentGrades,
  createGrade,
  updateGrade,
  deleteGrade,
} from '../controllers/grade.controller.js';
import { authenticate, isTeacherOrAdmin } from '../middleware/auth.middleware.js';
import { validate, validateGrade, validateGradeUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить все оценки
router.get('/', getAllGrades);

// Получить оценки ученика
router.get('/student/:studentId', getStudentGrades);

// Получить оценку по ID
router.get('/:id', getGradeById);

// Создать оценку (только учитель)
router.post('/', isTeacherOrAdmin, validate(validateGrade), createGrade);

// Обновить оценку (только учитель, который выставил, или админ)
router.put('/:id', isTeacherOrAdmin, validate(validateGradeUpdate), updateGrade);

// Удалить оценку (только учитель, который выставил, или админ)
router.delete('/:id', isTeacherOrAdmin, deleteGrade);

export default router;

