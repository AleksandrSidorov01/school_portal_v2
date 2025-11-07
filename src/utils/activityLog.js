import prisma from '../config/database.js';

// Создать запись в логе активности
export const logActivity = async (userId, action, entity, entityId, details = null, req = null) => {
  try {
    const logData = {
      userId: userId || null,
      action, // create, update, delete
      entity, // user, class, subject, grade, etc.
      entityId: entityId || null,
      details: details ? JSON.stringify(details) : null,
    };

    // Добавляем информацию о запросе, если доступна
    if (req) {
      logData.ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
      logData.userAgent = req.headers['user-agent'] || null;
    }

    await prisma.activityLog.create({
      data: logData,
    });
  } catch (error) {
    console.error('Ошибка логирования активности:', error);
    // Не прерываем выполнение при ошибке логирования
  }
};

// Получить логи активности
export const getActivityLogs = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.startDate) where.createdAt = { gte: new Date(filters.startDate) };
    if (filters.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
    });

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
  } catch (error) {
    console.error('Ошибка получения логов активности:', error);
    return [];
  }
};

