import prisma from '../config/database.js';

// Получить всех учителей
export const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
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
        subjects: true,
        classTeacher: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    });

    res.json({ teachers });
  } catch (error) {
    next(error);
  }
};

// Получить учителя по ID
export const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
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
        subjects: true,
        schedules: {
          include: {
            class: true,
            subject: true,
          },
        },
        classTeacher: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Учитель не найден' });
    }

    res.json({ teacher });
  } catch (error) {
    next(error);
  }
};

// Создать учителя
export const createTeacher = async (req, res, next) => {
  try {
    const { userId, employeeNumber, specialization, phone } = req.validatedData;

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

    res.status(201).json({
      message: 'Учитель успешно создан',
      teacher,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Учитель с таким пользователем уже существует' });
    }
    next(error);
  }
};

// Обновить учителя
export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeNumber, specialization, phone } = req.validatedData;

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
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

    res.json({
      message: 'Учитель успешно обновлен',
      teacher,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Учитель не найден' });
    }
    next(error);
  }
};

// Удалить учителя
export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.teacher.delete({
      where: { id },
    });

    res.json({ message: 'Учитель успешно удален' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Учитель не найден' });
    }
    next(error);
  }
};

