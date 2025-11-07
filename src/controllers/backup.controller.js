import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создать резервную копию базы данных
export const createBackup = async (req, res, next) => {
  try {
    // Получаем все данные из базы
    const [users, students, teachers, classes, subjects, grades, schedules, notifications] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.student.findMany(),
      prisma.teacher.findMany(),
      prisma.class.findMany(),
      prisma.subject.findMany(),
      prisma.grade.findMany(),
      prisma.schedule.findMany(),
      prisma.notification.findMany(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        students,
        teachers,
        classes,
        subjects,
        grades,
        schedules,
        notifications,
      },
    };

    // Создаем директорию для бэкапов, если её нет
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Сохраняем бэкап в файл
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(backupDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8');

    // Логируем действие
    await logActivity(req.user.id, 'create', 'backup', filename, {
      filename,
      recordsCount: {
        users: users.length,
        students: students.length,
        teachers: teachers.length,
        classes: classes.length,
        subjects: subjects.length,
        grades: grades.length,
        schedules: schedules.length,
        notifications: notifications.length,
      },
    }, req);

    res.json({
      message: 'Резервная копия успешно создана',
      backup: {
        filename,
        timestamp: backup.timestamp,
        recordsCount: {
          users: users.length,
          students: students.length,
          teachers: teachers.length,
          classes: classes.length,
          subjects: subjects.length,
          grades: grades.length,
          schedules: schedules.length,
          notifications: notifications.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Получить список резервных копий
export const getBackups = async (req, res, next) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(backupDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ backups: files });
  } catch (error) {
    next(error);
  }
};

// Скачать резервную копию
export const downloadBackup = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Проверка безопасности - только файлы backup_*.json
    if (!filename.startsWith('backup_') || !filename.endsWith('.json')) {
      return res.status(400).json({ message: 'Некорректное имя файла' });
    }

    const backupDir = path.join(__dirname, '../../backups');
    const filepath = path.join(backupDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Резервная копия не найдена' });
    }

    // Логируем действие
    await logActivity(req.user.id, 'download', 'backup', filename, {
      filename,
    }, req);

    res.download(filepath, filename);
  } catch (error) {
    next(error);
  }
};

// Удалить резервную копию
export const deleteBackup = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Проверка безопасности
    if (!filename.startsWith('backup_') || !filename.endsWith('.json')) {
      return res.status(400).json({ message: 'Некорректное имя файла' });
    }

    const backupDir = path.join(__dirname, '../../backups');
    const filepath = path.join(backupDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Резервная копия не найдена' });
    }

    fs.unlinkSync(filepath);

    // Логируем действие
    await logActivity(req.user.id, 'delete', 'backup', filename, {
      filename,
    }, req);

    res.json({ message: 'Резервная копия успешно удалена' });
  } catch (error) {
    next(error);
  }
};

