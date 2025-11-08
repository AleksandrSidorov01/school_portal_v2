import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLog.js';

// Получить все домашние задания
export const getAllHomeworks = async (req, res, next) => {
  try {
    const { studentId, teacherId, subjectId, classId, completed } = req.query;
    const userId = req.user?.id;

    let where = {};
    
    // Если запрашивает студент, показываем задания для его класса или лично ему
    if (req.user?.role === 'STUDENT') {
      // Получаем студента по userId
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
        select: { id: true, classId: true },
      });
      
      if (student) {
        where = {
          OR: [
            { studentId: student.id }, // Личные задания
            { classId: student.classId, studentId: null }, // Задания для класса
          ],
        };
      } else {
        return res.json({ homeworks: [] });
      }
    } else if (req.user?.role === 'TEACHER') {
      // Для учителей показываем только их задания
      const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (teacher) {
        where.teacherId = teacher.id;
        if (studentId) where.studentId = studentId;
        if (subjectId) where.subjectId = subjectId;
        if (classId) where.classId = classId;
      } else {
        return res.json({ homeworks: [] });
      }
    } else {
      // Для админов
      if (studentId) where.studentId = studentId;
      if (teacherId) where.teacherId = teacherId;
      if (subjectId) where.subjectId = subjectId;
      if (classId) where.classId = classId;
    }
    
    // completed фильтр работает только для индивидуальных заданий
    // для заданий класса проверка выполняется через completions

    const homeworks = await prisma.homework.findMany({
      where,
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
        class: {
          select: {
            name: true,
            grade: true,
            id: true,
          },
          include: req.user?.role === 'TEACHER' ? {
            students: {
              select: {
                id: true,
              },
            },
          } : undefined,
        },
        completions: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
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
        dueDate: 'asc',
      },
    });

    // Парсим attachments для каждого задания
    const homeworksWithAttachments = homeworks.map(hw => {
      if (hw.attachments) {
        try {
          hw.attachments = JSON.parse(hw.attachments);
        } catch (e) {
          hw.attachments = [];
        }
      }
      return hw;
    });

    res.json({ homeworks: homeworksWithAttachments });
  } catch (error) {
    next(error);
  }
};

// Получить домашнее задание по ID
export const getHomeworkById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const homework = await prisma.homework.findUnique({
      where: { id },
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
        class: {
          include: {
            students: {
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
        completions: {
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
          },
        },
      },
    });

    if (!homework) {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }

    // Парсим attachments если они есть
    if (homework.attachments) {
      try {
        homework.attachments = JSON.parse(homework.attachments);
      } catch (e) {
        homework.attachments = [];
      }
    }

    res.json({ homework });
  } catch (error) {
    next(error);
  }
};

// Создать домашнее задание
export const createHomework = async (req, res, next) => {
  try {
    const { subjectId, teacherId, studentId, classId, title, description, dueDate, attachments } = req.validatedData;

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

    // Если указан класс, проверяем его существование
    if (classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return res.status(404).json({ message: 'Класс не найден' });
      }
    }

    // Если указан ученик, проверяем его существование
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        return res.status(404).json({ message: 'Ученик не найден' });
      }
    }

    const homework = await prisma.homework.create({
      data: {
        subjectId,
        teacherId,
        studentId: studentId || null,
        classId: classId || null,
        title,
        description,
        dueDate: new Date(dueDate),
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
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
        class: true,
      },
    });

    // УБРАНО: больше не создаем отдельные задания для каждого ученика
    // Задание для класса хранится как одна запись с classId
    // Это позволяет избежать дублирования и упрощает управление

    await logActivity(req.user?.id, 'create', 'homework', homework.id, {
      title: homework.title,
      subject: subject.name,
    });

    res.status(201).json({
      message: 'Домашнее задание успешно создано',
      homework,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить домашнее задание
export const updateHomework = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, completed } = req.validatedData;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const homework = await prisma.homework.update({
      where: { id },
      data: updateData,
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
        class: true,
      },
    });

    await logActivity(req.user?.id, 'update', 'homework', homework.id, {
      title: homework.title,
    });

    res.json({
      message: 'Домашнее задание успешно обновлено',
      homework,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }
    next(error);
  }
};

// Удалить домашнее задание
export const deleteHomework = async (req, res, next) => {
  try {
    const { id } = req.params;

    const homework = await prisma.homework.findUnique({
      where: { id },
    });

    if (!homework) {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }

    await prisma.homework.delete({
      where: { id },
    });

    await logActivity(req.user?.id, 'delete', 'homework', id, {
      title: homework.title,
    });

    res.json({ message: 'Домашнее задание успешно удалено' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }
    next(error);
  }
};

// Отметить задание как выполненное
export const markHomeworkAsCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Получаем задание
    const homework = await prisma.homework.findUnique({
      where: { id },
      include: {
        class: true,
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!homework) {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }

    // Получаем студента текущего пользователя
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(403).json({ message: 'Только студенты могут отмечать задания как выполненные' });
    }

    // Если задание для класса, создаем запись о выполнении
    if (homework.classId) {
      // Проверяем, не выполнено ли уже
      const existingCompletion = await prisma.homeworkCompletion.findUnique({
        where: {
          homeworkId_studentId: {
            homeworkId: id,
            studentId: student.id,
          },
        },
      });

      if (existingCompletion) {
        return res.status(400).json({ message: 'Задание уже отмечено как выполненное' });
      }

      // Создаем запись о выполнении
      await prisma.homeworkCompletion.create({
        data: {
          homeworkId: id,
          studentId: student.id,
        },
      });
    } else if (homework.studentId === student.id) {
      // Если задание индивидуальное и для этого студента
      await prisma.homework.update({
        where: { id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    } else {
      return res.status(403).json({ message: 'Нет доступа к этому заданию' });
    }

    // Получаем обновленное задание
    const updatedHomework = await prisma.homework.findUnique({
      where: { id },
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
        class: true,
        completions: {
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
          },
        },
      },
    });

    res.json({
      message: 'Домашнее задание отмечено как выполненное',
      homework: updatedHomework,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Задание уже отмечено как выполненное' });
    }
    next(error);
  }
};

// Получить статистику выполнения задания
export const getHomeworkCompletionStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const homework = await prisma.homework.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            students: {
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
        completions: {
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
          },
        },
      },
    });

    if (!homework) {
      return res.status(404).json({ message: 'Домашнее задание не найдено' });
    }

    if (!homework.classId) {
      return res.status(400).json({ message: 'Это задание не для класса' });
    }

    // Формируем список студентов с отметками выполнения
    const studentsWithCompletion = homework.class.students.map(student => {
      const completion = homework.completions.find(c => c.studentId === student.id);
      return {
        student: {
          id: student.id,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
        },
        completed: !!completion,
        completedAt: completion?.completedAt || null,
      };
    });

    res.json({
      homework: {
        id: homework.id,
        title: homework.title,
        class: homework.class,
      },
      students: studentsWithCompletion,
    });
  } catch (error) {
    next(error);
  }
};

