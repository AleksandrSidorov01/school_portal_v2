import prisma from '../config/database.js';

// Получить все расписание
export const getAllSchedules = async (req, res, next) => {
  try {
    const { classId, teacherId, dayOfWeek } = req.query;

    const where = {};
    if (classId) where.classId = classId;
    if (teacherId) where.teacherId = teacherId;
    if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek);

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
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
      orderBy: [
        { dayOfWeek: 'asc' },
        { lessonNumber: 'asc' },
      ],
    });

    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

// Получить расписание класса
export const getClassSchedule = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: { classId },
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
      orderBy: [
        { dayOfWeek: 'asc' },
        { lessonNumber: 'asc' },
      ],
    });

    res.json({ schedules });
  } catch (error) {
    next(error);
  }
};

// Получить расписание по ID
export const getScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        class: true,
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
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Запись расписания не найдена' });
    }

    res.json({ schedule });
  } catch (error) {
    next(error);
  }
};

// Создать запись в расписании
export const createSchedule = async (req, res, next) => {
  try {
    const { classId, subjectId, teacherId, dayOfWeek, lessonNumber, room } = req.validatedData;

    // Проверка существования класса
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return res.status(404).json({ message: 'Класс не найден' });
    }

    // Проверка существования предмета
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    // Проверка существования учителя
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Учитель не найден' });
    }

    // Проверка, что учитель ведет этот предмет
    if (subject.teacherId !== teacherId) {
      return res.status(400).json({ 
        message: 'Учитель не ведет этот предмет' 
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        lessonNumber,
        room,
      },
      include: {
        class: true,
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
    });

    res.status(201).json({
      message: 'Запись в расписании успешно создана',
      schedule,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'В это время у класса уже есть урок' 
      });
    }
    next(error);
  }
};

// Обновить расписание
export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { classId, subjectId, teacherId, dayOfWeek, lessonNumber, room } = req.validatedData;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        lessonNumber,
        room,
      },
      include: {
        class: true,
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
    });

    res.json({
      message: 'Расписание успешно обновлено',
      schedule,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Запись расписания не найдена' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'В это время у класса уже есть урок' 
      });
    }
    next(error);
  }
};

// Удалить запись из расписания
export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.schedule.delete({
      where: { id },
    });

    res.json({ message: 'Запись расписания успешно удалена' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Запись расписания не найдена' });
    }
    next(error);
  }
};

