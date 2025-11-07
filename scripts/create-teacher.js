import bcrypt from 'bcryptjs';
import prisma from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTeacher() {
  try {
    const email = process.argv[2] || 'teacher@school.com';
    const password = process.argv[3] || 'teacher123';
    const firstName = process.argv[4] || 'Учитель';
    const lastName = process.argv[5] || 'Тестовый';
    const specialization = process.argv[6] || 'Математика';
    const employeeNumber = process.argv[7] || null;
    const phone = process.argv[8] || null;

    console.log('👨‍🏫 Создание учителя...');
    console.log(`Email: ${email}`);
    console.log(`Пароль: ${password}`);
    console.log(`Имя: ${firstName} ${lastName}`);
    console.log(`Специализация: ${specialization}`);

    // Проверка существования пользователя
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log('⚠️  Пользователь с таким email уже существует!');
      
      // Если пользователь существует, обновляем роль на TEACHER
      if (user.role !== 'TEACHER') {
        user = await prisma.user.update({
          where: { email },
          data: { role: 'TEACHER' },
        });
        console.log('✅ Роль обновлена на TEACHER');
      } else {
        console.log('✅ Пользователь уже имеет роль TEACHER');
      }
    } else {
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание пользователя с ролью TEACHER
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'TEACHER',
        },
      });

      console.log('✅ Пользователь успешно создан!');
    }

    // Проверка существования профиля учителя
    const existingTeacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (existingTeacher) {
      console.log('⚠️  Профиль учителя уже существует!');
      console.log(`📋 ID учителя: ${existingTeacher.id}`);
      process.exit(0);
    }

    // Создание профиля учителя
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeNumber,
        specialization,
        phone,
      },
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
    });

    console.log('\n✅ Учитель успешно создан!');
    console.log(`📧 Email: ${teacher.user.email}`);
    console.log(`👤 Имя: ${teacher.user.firstName} ${teacher.user.lastName}`);
    console.log(`🔑 Роль: ${teacher.user.role}`);
    console.log(`📚 Специализация: ${teacher.specialization || 'Не указана'}`);
    console.log(`🆔 ID учителя: ${teacher.id}`);
    console.log('\n💡 Теперь вы можете войти в систему с этими данными!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании учителя:', error.message);
    if (error.code === 'P2002') {
      console.error('💡 Учитель с таким пользователем уже существует');
    }
    process.exit(1);
  }
}

createTeacher();

