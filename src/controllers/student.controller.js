import prisma from '../config/database.js';

// Получить всех учеников
export const getAllStudents = async (req, res, next) => {
  try {
    const { classId } = req.query;

    const where = classId ? { classId } : {};

    const students = await prisma.student.findMany({
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
        class: {
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

    res.json({ students });
  } catch (error) {
    next(error);
  }
};

// Получить ученика по ID
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
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
        class: true,
        grades: {
          include: {
            subject: true,
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
            date: 'desc',
          },
        },
        schedules: {
          include: {
            subject: true,
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
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Ученик не найден' });
    }

    res.json({ student });
  } catch (error) {
    next(error);
  }
};

// Создать ученика
export const createStudent = async (req, res, next) => {
  try {
    const { userId, classId, studentNumber, birthDate, address, phone } = req.validatedData;

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

    res.status(201).json({
      message: 'Ученик успешно создан',
      student,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ученик с таким пользователем уже существует' });
    }
    next(error);
  }
};

// Обновить ученика
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { classId, studentNumber, birthDate, address, phone } = req.validatedData;

    const updateData = {
      studentNumber,
      address,
      phone,
    };

    if (classId) {
      // Проверка существования класса
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return res.status(404).json({ message: 'Класс не найден' });
      }

      updateData.classId = classId;
    }

    if (birthDate) {
      updateData.birthDate = new Date(birthDate);
    }

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
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

    res.json({
      message: 'Ученик успешно обновлен',
      student,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Ученик не найден' });
    }
    next(error);
  }
};

// Удалить ученика
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id },
    });

    res.json({ message: 'Ученик успешно удален' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Ученик не найден' });
    }
    next(error);
  }
};

