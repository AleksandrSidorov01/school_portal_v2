import { getActivityLogs } from '../utils/activityLog.js';

// Получить логи активности (только для админов)
export const getActivityLogsController = async (req, res, next) => {
  try {
    const { userId, entity, action, startDate, endDate, limit } = req.query;

    const logs = await getActivityLogs({
      userId,
      entity,
      action,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 100,
    });

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

