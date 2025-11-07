import prisma from '../config/database.js';

// Получить все уведомления пользователя
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Последние 50 уведомлений
    });

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

// Отметить уведомление как прочитанное
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ message: 'Уведомление отмечено как прочитанное', notification });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }
    next(error);
  }
};

// Отметить все уведомления как прочитанные
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ message: 'Все уведомления отмечены как прочитанные' });
  } catch (error) {
    next(error);
  }
};

// Удалить уведомление
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ message: 'Уведомление удалено' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }
    next(error);
  }
};

// Получить количество непрочитанных уведомлений
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

