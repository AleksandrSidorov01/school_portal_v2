import express from 'express';
import {
  getStatistics,
  getAllUsers,
  createUser,
  deleteUser,
  getAllSubjects,
  createSubject,
  deleteSubject,
} from '../controllers/admin.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Все маршруты требуют аутентификации и роль ADMIN
router.use(authenticate);
router.use(isAdmin);

// Статистика системы
router.get('/statistics', getStatistics);

// Управление пользователями
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

// Управление предметами
router.get('/subjects', getAllSubjects);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);

export default router;

