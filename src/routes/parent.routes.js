import express from 'express';
import {
  getAllParents,
  getParentById,
  getParentByUserId,
  createParent,
  updateParent,
  deleteParent,
  addStudentToParent,
  removeStudentFromParent,
} from '../controllers/parent.controller.js';
import { authenticate, isAdmin, authorize } from '../middleware/auth.middleware.js';
import { validate, validateParent, validateParentUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить родителя текущего пользователя
router.get('/me', getParentByUserId);

// Получить всех родителей (только админ)
router.get('/', isAdmin, getAllParents);

// Получить родителя по ID (только админ или сам родитель)
router.get('/:id', getParentById);

// Создать родителя (только админ)
router.post('/', isAdmin, validate(validateParent), createParent);

// Обновить родителя (только админ или сам родитель)
router.put('/:id', validate(validateParentUpdate), updateParent);

// Удалить родителя (только админ)
router.delete('/:id', isAdmin, deleteParent);

// Добавить ученика к родителю
router.post('/:id/students', addStudentToParent);

// Удалить ученика у родителя
router.delete('/:id/students/:studentId', removeStudentFromParent);

export default router;

