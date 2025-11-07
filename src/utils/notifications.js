import prisma from '../config/database.js';

// Создать уведомление
export const createNotification = async (userId, type, title, message) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });
    return notification;
  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
    return null;
  }
};

// Уведомление о новой оценке
export const notifyGradeAdded = async (studentId, gradeValue, subjectName) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (student) {
      await createNotification(
        student.userId,
        'grade_added',
        'Новая оценка',
        `Вам выставлена оценка ${gradeValue} по предмету "${subjectName}"`
      );
    }
  } catch (error) {
    console.error('Ошибка создания уведомления об оценке:', error);
  }
};

// Уведомление об изменении оценки
export const notifyGradeUpdated = async (studentId, gradeValue, subjectName) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (student) {
      await createNotification(
        student.userId,
        'grade_updated',
        'Оценка изменена',
        `Ваша оценка по предмету "${subjectName}" изменена на ${gradeValue}`
      );
    }
  } catch (error) {
    console.error('Ошибка создания уведомления об изменении оценки:', error);
  }
};

// Уведомление о создании профиля
export const notifyProfileCreated = async (userId, profileType) => {
  try {
    await createNotification(
      userId,
      'profile_created',
      'Профиль создан',
      `Ваш профиль ${profileType === 'student' ? 'ученика' : 'учителя'} успешно создан`
    );
  } catch (error) {
    console.error('Ошибка создания уведомления о профиле:', error);
  }
};

