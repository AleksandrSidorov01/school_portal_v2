import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить все уведомления пользователя
router.get('/', getMyNotifications);

// Получить количество непрочитанных
router.get('/unread-count', getUnreadCount);

// Отметить все как прочитанные
router.put('/mark-all-read', markAllAsRead);

// Отметить уведомление как прочитанное
router.put('/:id/read', markAsRead);

// Удалить уведомление
router.delete('/:id', deleteNotification);

export default router;

