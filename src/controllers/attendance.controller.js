import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLog.js';

// Получить всю посещаемость
export const getAllAttendances = async (req, res, next) => {
  try {
    const { studentId, scheduleId, date, status, teacherId } = req.query;
    const user = req.user;

    const where = {};
    
    // Если запрашивает учитель, показываем только посещаемость по его предметам
    if (user?.role === 'TEACHER' && !studentId) {
      // Получаем ID учителя
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (teacher) {
        // Получаем все расписания этого учителя
        const teacherSchedules = await prisma.schedule.findMany({
          where: { teacherId: teacher.id },
          select: { id: true },
        });

        const scheduleIds = teacherSchedules.map(s => s.id);
        
        if (scheduleIds.length > 0) {
          where.scheduleId = { in: scheduleIds };
        } else {
          // Если у учителя нет расписаний, возвращаем пустой список
          return res.json({ attendances: [] });
        }
      }
    }

    if (studentId) where.studentId = studentId;
    if (scheduleId) where.scheduleId = scheduleId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    if (status) where.status = status;

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
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
        schedule: {
          include: {
            subject: true,
            class: {
              select: {
                name: true,
                grade: true,
              },
            },
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
      orderBy: {
        date: 'desc',
      },
    });

    res.json({ attendances });
  } catch (error) {
    next(error);
  }
};

// Получить посещаемость по ID
export const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
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
        schedule: {
          include: {
            subject: true,
            class: true,
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

    if (!attendance) {
      return res.status(404).json({ message: 'Запись о посещаемости не найдена' });
    }

    res.json({ attendance });
  } catch (error) {
    next(error);
  }
};

// Создать запись о посещаемости
export const createAttendance = async (req, res, next) => {
  try {
    const { studentId, scheduleId, date, status, comment } = req.validatedData;

    // Проверка существования ученика
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Ученик не найден' });
    }

    // Проверка существования расписания
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Расписание не найдено' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        scheduleId,
        date: date ? new Date(date) : new Date(),
        status,
        comment,
      },
      include: {
        student: {
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
        schedule: {
          include: {
            subject: true,
            class: true,
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

    await logActivity(req.user?.id, 'create', 'attendance', attendance.id, {
      student: `${student.user.firstName} ${student.user.lastName}`,
      status,
    });

    res.status(201).json({
      message: 'Запись о посещаемости успешно создана',
      attendance,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Запись о посещаемости для этого ученика, расписания и даты уже существует' });
    }
    next(error);
  }
};

// Создать записи о посещаемости для всего класса
export const createAttendancesForClass = async (req, res, next) => {
  try {
    const { classId, scheduleId, date, attendances } = req.body;
    const user = req.user;

    // Проверка существования класса
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return res.status(404).json({ message: 'Класс не найден' });
    }

    // Проверка существования расписания
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        teacher: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Расписание не найдено' });
    }

    // Проверка, что учитель может создавать посещаемость только для своих предметов
    if (user?.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });

      if (!teacher || schedule.teacherId !== teacher.id) {
        return res.status(403).json({ message: 'Нет доступа к этому расписанию' });
      }
    }

    // Получаем всех учеников класса
    const students = await prisma.student.findMany({
      where: { classId },
    });

    const attendanceDate = date ? new Date(date) : new Date();

    // Создаем записи о посещаемости
    const attendanceData = students.map(student => {
      const attendance = attendances.find(a => a.studentId === student.id);
      return {
        studentId: student.id,
        scheduleId,
        date: attendanceDate,
        status: attendance?.status || 'present',
        comment: attendance?.comment || null,
      };
    });

    // Нормализуем дату для корректного сравнения
    const startDate = new Date(attendanceDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(attendanceDate);
    endDate.setHours(23, 59, 59, 999);

    // Удаляем существующие записи для этой даты и расписания
    await prisma.attendance.deleteMany({
      where: {
        scheduleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        studentId: {
          in: students.map(s => s.id),
        },
      },
    });

    const createdAttendances = await prisma.attendance.createMany({
      data: attendanceData,
    });

    await logActivity(req.user?.id, 'create', 'attendance', null, {
      class: classExists.name,
      count: createdAttendances.count,
    });

    res.status(201).json({
      message: `Создано ${createdAttendances.count} записей о посещаемости`,
      count: createdAttendances.count,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить запись о посещаемости
export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment, date } = req.validatedData;

    const updateData = {};
    if (status) updateData.status = status;
    if (comment !== undefined) updateData.comment = comment;
    if (date) updateData.date = new Date(date);

    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        student: {
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
        schedule: {
          include: {
            subject: true,
            class: true,
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

    await logActivity(req.user?.id, 'update', 'attendance', attendance.id, {
      status: attendance.status,
    });

    res.json({
      message: 'Запись о посещаемости успешно обновлена',
      attendance,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Запись о посещаемости не найдена' });
    }
    next(error);
  }
};

// Удалить запись о посещаемости
export const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Запись о посещаемости не найдена' });
    }

    await prisma.attendance.delete({
      where: { id },
    });

    await logActivity(req.user?.id, 'delete', 'attendance', id);

    res.json({ message: 'Запись о посещаемости успешно удалена' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Запись о посещаемости не найдена' });
    }
    next(error);
  }
};

// Получить статистику посещаемости для ученика
export const getStudentAttendanceStats = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const where = { studentId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      select: {
        status: true,
      },
    });

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      late: attendances.filter(a => a.status === 'late').length,
      excused: attendances.filter(a => a.status === 'excused').length,
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

