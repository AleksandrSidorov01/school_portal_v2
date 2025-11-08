import prisma from '../config/database.js';

// Получить всех родителей
export const getAllParents = async (req, res, next) => {
  try {
    const parents = await prisma.parent.findMany({
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
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: {
              select: {
                name: true,
                grade: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          lastName: 'asc',
        },
      },
    });

    res.json({ parents });
  } catch (error) {
    next(error);
  }
};

// Получить родителя по ID
export const getParentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parent = await prisma.parent.findUnique({
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
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: {
              select: {
                name: true,
                grade: true,
              },
            },
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
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ message: 'Родитель не найден' });
    }

    res.json({ parent });
  } catch (error) {
    next(error);
  }
};

// Получить родителя по userId (для текущего пользователя)
export const getParentByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const parent = await prisma.parent.findUnique({
      where: { userId },
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
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: {
              select: {
                name: true,
                grade: true,
              },
            },
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
            attendances: {
              include: {
                schedule: {
                  include: {
                    subject: true,
                  },
                },
              },
              orderBy: {
                date: 'desc',
              },
            },
            homeworks: {
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
                dueDate: 'asc',
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({ message: 'Родитель не найден' });
    }

    res.json({ parent });
  } catch (error) {
    next(error);
  }
};

// Создать родителя
export const createParent = async (req, res, next) => {
  try {
    const { userId, phone, address, studentIds } = req.validatedData;

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role !== 'PARENT') {
      return res.status(400).json({ message: 'Пользователь должен иметь роль PARENT' });
    }

    // Проверка существования учеников
    if (studentIds && studentIds.length > 0) {
      const students = await prisma.student.findMany({
        where: { id: { in: studentIds } },
      });

      if (students.length !== studentIds.length) {
        return res.status(404).json({ message: 'Один или несколько учеников не найдены' });
      }
    }

    const parent = await prisma.parent.create({
      data: {
        userId,
        phone,
        address,
        students: studentIds ? {
          connect: studentIds.map(id => ({ id })),
        } : undefined,
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
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Родитель успешно создан',
      parent,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Родитель с таким пользователем уже существует' });
    }
    next(error);
  }
};

// Обновить родителя
export const updateParent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone, address, studentIds } = req.validatedData;

    const updateData = {
      phone,
      address,
    };

    if (studentIds !== undefined) {
      // Проверка существования учеников
      if (studentIds.length > 0) {
        const students = await prisma.student.findMany({
          where: { id: { in: studentIds } },
        });

        if (students.length !== studentIds.length) {
          return res.status(404).json({ message: 'Один или несколько учеников не найдены' });
        }
      }

      updateData.students = {
        set: studentIds.map(id => ({ id })),
      };
    }

    const parent = await prisma.parent.update({
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
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: true,
          },
        },
      },
    });

    res.json({
      message: 'Родитель успешно обновлен',
      parent,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Родитель не найден' });
    }
    next(error);
  }
};

// Удалить родителя
export const deleteParent = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.parent.delete({
      where: { id },
    });

    res.json({ message: 'Родитель успешно удален' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Родитель не найден' });
    }
    next(error);
  }
};

// Добавить ученика к родителю
export const addStudentToParent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Ученик не найден' });
    }

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        students: {
          connect: { id: studentId },
        },
      },
      include: {
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: true,
          },
        },
      },
    });

    res.json({
      message: 'Ученик успешно добавлен к родителю',
      parent,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Родитель не найден' });
    }
    next(error);
  }
};

// Удалить ученика у родителя
export const removeStudentFromParent = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;

    const parent = await prisma.parent.update({
      where: { id },
      data: {
        students: {
          disconnect: { id: studentId },
        },
      },
      include: {
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            class: true,
          },
        },
      },
    });

    res.json({
      message: 'Ученик успешно удален у родителя',
      parent,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Родитель не найден' });
    }
    next(error);
  }
};

