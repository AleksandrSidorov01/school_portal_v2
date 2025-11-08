import express from 'express';
import {
  getAllHomeworks,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
  markHomeworkAsCompleted,
  getHomeworkCompletionStats,
} from '../controllers/homework.controller.js';
import { authenticate, isTeacherOrAdmin, authorize } from '../middleware/auth.middleware.js';
import { validate, validateHomework, validateHomeworkUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить все домашние задания
router.get('/', getAllHomeworks);

// Получить домашнее задание по ID
router.get('/:id', getHomeworkById);

// Создать домашнее задание (только учитель или админ)
router.post('/', isTeacherOrAdmin, validate(validateHomework), createHomework);

// Обновить домашнее задание (только учитель или админ)
router.put('/:id', isTeacherOrAdmin, validate(validateHomeworkUpdate), updateHomework);

// Отметить задание как выполненное (ученик)
router.patch('/:id/complete', authorize('STUDENT', 'TEACHER', 'ADMIN'), markHomeworkAsCompleted);

// Получить статистику выполнения задания (для учителя)
router.get('/:id/completion-stats', isTeacherOrAdmin, getHomeworkCompletionStats);

// Удалить домашнее задание (только учитель или админ)
router.delete('/:id', isTeacherOrAdmin, deleteHomework);

export default router;

