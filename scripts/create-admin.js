import bcrypt from 'bcryptjs';
import prisma from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    const email = process.argv[2] || 'admin@school.com';
    const password = process.argv[3] || 'admin123';
    const firstName = process.argv[4] || 'Администратор';
    const lastName = process.argv[5] || 'Системы';

    console.log('🔐 Создание администратора...');
    console.log(`Email: ${email}`);
    console.log(`Пароль: ${password}`);

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  Пользователь с таким email уже существует!');
      console.log('💡 Хотите обновить его роль на ADMIN? (y/n)');
      // Для автоматического обновления раскомментируйте:
      // await prisma.user.update({
      //   where: { email },
      //   data: { role: 'ADMIN' },
      // });
      // console.log('✅ Роль обновлена на ADMIN');
      process.exit(0);
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание администратора
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN',
      },
    });

    console.log('✅ Администратор успешно создан!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Имя: ${admin.firstName} ${admin.lastName}`);
    console.log(`🔑 Роль: ${admin.role}`);
    console.log('\n💡 Теперь вы можете войти в систему с этими данными!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error.message);
    process.exit(1);
  }
}

createAdmin();

