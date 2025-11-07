import prisma from '../config/database.js';

// Проверка здоровья базы данных
export const checkDatabaseHealth = async () => {
  try {
    // Простой запрос для проверки соединения
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
};

// Закрытие всех соединений
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

