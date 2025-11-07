import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Увеличиваем timeout для SQLite
if (process.env.DATABASE_URL?.startsWith('file:')) {
  // Для SQLite увеличиваем timeout до 30 секунд
  prisma.$connect().catch(console.error);
}

export default prisma;

