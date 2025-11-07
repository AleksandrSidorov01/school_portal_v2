import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { logActivity } from '../utils/activityLog.js';
import { notifyProfileCreated } from '../utils/notifications.js';

// Получить статистику системы
export const getStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalGrades,
      totalSubjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.grade.count(),
      prisma.subject.count(),
    ]);

    res.json({
      statistics: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalClasses,
        totalGrades,
        totalSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Получить всех пользователей (для админа)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            class: {
              select: {
                name: true,
                grade: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// Создать пользователя (админ)
export const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Логируем действие
    await logActivity(req.user.id, 'create', 'user', user.id, {
      email: user.email,
      role: user.role,
    }, req);

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить пользователя (админ)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role } = req.body;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Если email изменяется, проверяем уникальность
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Логируем действие
    await logActivity(req.user.id, 'update', 'user', user.id, {
      email: user.email,
      role: user.role,
    }, req);

    res.json({
      message: 'Пользователь успешно обновлен',
      user,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    next(error);
  }
};

// Удалить пользователя (админ)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Нельзя удалить самого себя
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Нельзя удалить самого себя' });
    }

    // Получаем информацию о пользователе перед удалением для логирования
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await prisma.user.delete({
      where: { id },
    });

    // Логируем действие
    await logActivity(req.user.id, 'delete', 'user', id, {
      email: user.email,
    }, req);

    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    next(error);
  }
};

// Управление предметами (для админа)
export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({ subjects });
  } catch (error) {
    next(error);
  }
};

// Создать предмет
export const createSubject = async (req, res, next) => {
  try {
    const { name, description, teacherId } = req.body;

    // Проверка существования учителя
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Учитель не найден' });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: 'Предмет успешно создан',
      subject,
    });
  } catch (error) {
    next(error);
  }
};

// Удалить предмет
export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.subject.delete({
      where: { id },
    });

    res.json({ message: 'Предмет успешно удален' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Предмет не найден' });
    }
    next(error);
  }
};

// Создать профиль ученика (админ)
export const createStudentProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { classId, studentNumber, birthDate, address, phone } = req.body;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role !== 'STUDENT') {
      return res.status(400).json({ message: 'Пользователь должен иметь роль STUDENT' });
    }

    // Проверка существования профиля
    const existingStudent = await prisma.student.findUnique({
      where: { userId },
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Профиль ученика уже существует' });
    }

    // Проверка существования класса
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return res.status(404).json({ message: 'Класс не найден' });
    }

    const student = await prisma.student.create({
      data: {
        userId,
        classId,
        studentNumber,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        phone,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        class: true,
      },
    });

    // Уведомление о создании профиля
    await notifyProfileCreated(userId, 'student');

    // Логируем действие
    await logActivity(req.user.id, 'create', 'student_profile', student.id, {
      userId,
      classId,
    }, req);

    res.status(201).json({ message: 'Профиль ученика успешно создан', student });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Профиль ученика с таким пользователем уже существует' });
    }
    next(error);
  }
};

// Создать профиль учителя (админ)
export const createTeacherProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { employeeNumber, specialization, phone } = req.body;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role !== 'TEACHER') {
      return res.status(400).json({ message: 'Пользователь должен иметь роль TEACHER' });
    }

    // Проверка существования профиля
    const existingTeacher = await prisma.teacher.findUnique({
      where: { userId },
    });

    if (existingTeacher) {
      return res.status(400).json({ message: 'Профиль учителя уже существует' });
    }

    const teacher = await prisma.teacher.create({
      data: {
        userId,
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
          },
        },
      },
    });

    // Уведомление о создании профиля
    await notifyProfileCreated(userId, 'teacher');

    // Логируем действие
    await logActivity(req.user.id, 'create', 'teacher_profile', teacher.id, {
      userId,
      specialization,
    }, req);

    res.status(201).json({ message: 'Профиль учителя успешно создан', teacher });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Профиль учителя с таким пользователем уже существует' });
    }
    next(error);
  }
};
