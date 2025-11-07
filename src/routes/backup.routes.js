import express from 'express';
import {
  createBackup,
  getBackups,
  downloadBackup,
  deleteBackup,
} from '../controllers/backup.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Все маршруты требуют аутентификации и прав администратора
router.use(authenticate);
router.use(isAdmin);

// Создать резервную копию
router.post('/', createBackup);

// Получить список резервных копий
router.get('/', getBackups);

// Скачать резервную копию
router.get('/:filename', downloadBackup);

// Удалить резервную копию
router.delete('/:filename', deleteBackup);

export default router;

