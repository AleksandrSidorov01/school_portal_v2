import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import prisma from '../config/database.js';

// Проверка JWT токена
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Получаем пользователя из БД
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек' });
    }
    return res.status(500).json({ message: 'Ошибка аутентификации' });
  }
};

// Проверка роли пользователя
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Недостаточно прав доступа' 
      });
    }

    next();
  };
};

// Проверка, что пользователь является администратором
export const isAdmin = authorize('ADMIN');

// Проверка, что пользователь является учителем или администратором
export const isTeacherOrAdmin = authorize('TEACHER', 'ADMIN');

