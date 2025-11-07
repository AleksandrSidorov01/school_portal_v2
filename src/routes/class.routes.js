import express from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/class.controller.js';
import { authenticate, isAdmin, isTeacherOrAdmin } from '../middleware/auth.middleware.js';
import { validate, validateClass } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить все классы
router.get('/', getAllClasses);

// Получить класс по ID
router.get('/:id', getClassById);

// Создать класс (только админ и учитель)
router.post('/', isTeacherOrAdmin, validate(validateClass), createClass);

// Обновить класс (только админ и учитель)
router.put('/:id', isTeacherOrAdmin, validate(validateClass), updateClass);

// Удалить класс (только админ)
router.delete('/:id', isAdmin, deleteClass);

export default router;

