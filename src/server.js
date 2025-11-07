import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import classRoutes from './routes/class.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import gradeRoutes from './routes/grade.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import backupRoutes from './routes/backup.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/backup', backupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Школьный портал работает!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📚 Школьный портал готов к работе!`);
});

// Обработка ошибки занятого порта
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Ошибка: Порт ${PORT} уже занят!`);
    console.error(`💡 Решение:`);
    console.error(`   1. Остановите другой процесс на порту ${PORT}`);
    console.error(`   2. Или измените PORT в файле .env`);
    console.error(`   3. Или используйте команду: netstat -ano | findstr :${PORT} для поиска процесса`);
    process.exit(1);
  } else {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
});

