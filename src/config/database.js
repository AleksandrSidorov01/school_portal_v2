import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Проверка доступности базы данных при старте
prisma.$connect()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено');
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
    console.error('💡 Проверьте:');
    console.error('   1. Файл .env существует и содержит DATABASE_URL="file:./prisma/dev.db"');
    console.error('   2. База данных prisma/dev.db существует');
    console.error('   3. Нет других процессов, использующих базу данных');
  });

export default prisma;

