import prisma from '../config/database.js';
import { notifyGradeAdded } from '../utils/notifications.js';
import { logActivity } from '../utils/activityLog.js';

// Получить все оценки
export const getAllGrades = async (req, res, next) => {
  try {
    const { studentId, subjectId, teacherId } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;

    const grades = await prisma.grade.findMany({
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
    });

    res.json({ grades });
  } catch (error) {
    next(error);
  }
};

// Получить оценку по ID
export const getGradeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.findUnique({
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

    if (!grade) {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }

    res.json({ grade });
  } catch (error) {
    next(error);
  }
};

// Получить оценки ученика
export const getStudentGrades = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const grades = await prisma.grade.findMany({
      where: { studentId },
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
    });

    res.json({ grades });
  } catch (error) {
    next(error);
  }
};

// Создать оценку
export const createGrade = async (req, res, next) => {
  try {
    const { studentId, subjectId, value, comment, date } = req.validatedData;

    // Получаем учителя из текущего пользователя
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.id },
    });

    if (!teacher) {
      return res.status(403).json({ message: 'Только учителя могут выставлять оценки' });
    }

    // Проверка существования ученика
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: 'Ученик не найден' });
    }

    // Проверка существования предмета
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }

    // Проверка, что учитель ведет этот предмет
    if (subject.teacherId !== teacher.id) {
      return res.status(403).json({ 
        message: 'Вы не можете выставлять оценки по этому предмету' 
      });
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        teacherId: teacher.id,
        value,
        comment,
        date: date ? new Date(date) : new Date(),
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
    });

    // Создаем уведомление для ученика
    await notifyGradeAdded(studentId, value, grade.subject.name);

    // Логируем действие
    await logActivity(req.user.id, 'create', 'grade', grade.id, {
      studentId,
      subjectId,
      value,
      subjectName: grade.subject.name,
    }, req);

    res.status(201).json({
      message: 'Оценка успешно создана',
      grade,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить оценку
export const updateGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, comment, date } = req.validatedData;

    // Проверка существования оценки
    const existingGrade = await prisma.grade.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });

    if (!existingGrade) {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }

    // Проверка прав (только учитель, который выставил оценку, или админ)
    if (req.user.role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id },
      });

      if (!teacher || existingGrade.teacherId !== teacher.id) {
        return res.status(403).json({ 
          message: 'Вы не можете редактировать эту оценку' 
        });
      }
    }

    const updateData = {};
    if (value !== undefined) updateData.value = value;
    if (comment !== undefined) updateData.comment = comment;
    if (date) updateData.date = new Date(date);

    const grade = await prisma.grade.update({
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
    });

    // Создаем уведомление об изменении оценки
    if (updateData.value) {
      await notifyGradeUpdated(grade.studentId, updateData.value, grade.subject.name);
    }

    // Логируем действие
    await logActivity(req.user.id, 'update', 'grade', grade.id, {
      changes: updateData,
      subjectName: grade.subject.name,
    }, req);

    res.json({
      message: 'Оценка успешно обновлена',
      grade,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }
    next(error);
  }
};

// Удалить оценку
export const deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Проверка существования оценки
    const existingGrade = await prisma.grade.findUnique({
      where: { id },
    });

    if (!existingGrade) {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }

    // Проверка прав (только учитель, который выставил оценку, или админ)
    if (req.user.role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id },
      });

      if (!teacher || existingGrade.teacherId !== teacher.id) {
        return res.status(403).json({ 
          message: 'Вы не можете удалить эту оценку' 
        });
      }
    }

    // Получаем информацию об оценке перед удалением для логирования
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        subject: true,
        student: true,
      },
    });

    await prisma.grade.delete({
      where: { id },
    });

    // Логируем действие
    if (grade) {
      await logActivity(req.user.id, 'delete', 'grade', id, {
        studentId: grade.studentId,
        subjectName: grade.subject?.name,
        value: grade.value,
      }, req);
    }

    res.json({ message: 'Оценка успешно удалена' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Оценка не найдена' });
    }
    next(error);
  }
};

