import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validate, validateRegister, validateLogin } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Регистрация
router.post('/register', validate(validateRegister), register);

// Вход
router.post('/login', validate(validateLogin), login);

// Получить текущего пользователя (требует аутентификации)
router.get('/me', authenticate, getMe);

export default router;

