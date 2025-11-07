import prisma from '../config/database.js';

// Получить все классы
export const getAllClasses = async (req, res, next) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        classTeacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { grade: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json({ classes });
  } catch (error) {
    next(error);
  }
};

// Получить класс по ID
export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        classTeacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
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

    if (!classItem) {
      return res.status(404).json({ message: 'Класс не найден' });
    }

    res.json({ class: classItem });
  } catch (error) {
    next(error);
  }
};

// Создать класс
export const createClass = async (req, res, next) => {
  try {
    const { name, grade, description } = req.validatedData;

    const classItem = await prisma.class.create({
      data: {
        name,
        grade,
        description,
      },
    });

    res.status(201).json({
      message: 'Класс успешно создан',
      class: classItem,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'Класс с таким именем и номером уже существует' 
      });
    }
    next(error);
  }
};

// Обновить класс
export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, grade, description } = req.validatedData;

    const classItem = await prisma.class.update({
      where: { id },
      data: {
        name,
        grade,
        description,
      },
    });

    res.json({
      message: 'Класс успешно обновлен',
      class: classItem,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Класс не найден' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'Класс с таким именем и номером уже существует' 
      });
    }
    next(error);
  }
};

// Удалить класс
export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.class.delete({
      where: { id },
    });

    res.json({ message: 'Класс успешно удален' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Класс не найден' });
    }
    next(error);
  }
};

