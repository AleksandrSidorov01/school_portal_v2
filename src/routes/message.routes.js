import express from 'express';
import {
  getAllMessages,
  getMessageById,
  getConversation,
  getConversations,
  createMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  getUnreadCount,
} from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, validateMessage, validateMessageUpdate } from '../utils/validation.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получить количество непрочитанных сообщений
router.get('/unread-count', getUnreadCount);

// Получить список диалогов
router.get('/conversations', getConversations);

// Получить все сообщения
router.get('/', getAllMessages);

// Получить диалог с пользователем
router.get('/conversation/:userId', getConversation);

// Получить сообщение по ID
router.get('/:id', getMessageById);

// Создать сообщение
router.post('/', validate(validateMessage), createMessage);

// Обновить сообщение
router.put('/:id', validate(validateMessageUpdate), updateMessage);

// Отметить сообщение как прочитанное
router.patch('/:id/read', markMessageAsRead);

// Удалить сообщение
router.delete('/:id', deleteMessage);

export default router;

