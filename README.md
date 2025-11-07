# Школьный портал

Система управления учебным процессом для школ.

## Функционал

- ✅ Система авторизации и регистрации
- ✅ Управление классами
- ✅ Управление учениками и учителями
- ✅ Система оценок
- ✅ Расписание занятий
- ✅ Панель администратора

## Технологический стек

### Backend
- **Node.js + Express** - серверная часть
- **PostgreSQL** - база данных
- **Prisma** - ORM
- **JWT** - аутентификация
- **Joi** - валидация

### Frontend
- **React 19** - UI библиотека
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Tailwind CSS** - стилизация
- **Vite** - сборщик

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения (создайте `.env` файл в корне проекта):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_portal?schema=public"
JWT_SECRET="school-portal-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

   **Важно:** Если у вас другой пароль для PostgreSQL, замените `postgres:postgres` на `ваш_пользователь:ваш_пароль`.

4. Сгенерируйте Prisma Client:
```bash
npm run prisma:generate
```

5. Запустите миграции:
```bash
npm run prisma:migrate
```

6. Запустите сервер:
```bash
npm run dev
```

### Запуск Frontend

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
```

3. Создайте файл `.env` в папке `frontend`:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Запустите frontend:
```bash
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173`

Подробная инструкция: см. [FRONTEND_SETUP.md](FRONTEND_SETUP.md)

**Если порт 3000 занят:**
- Остановите процесс: `npm run stop`
- Или найдите и остановите процесс вручную: `netstat -ano | findstr :3000`
- Или измените `PORT` в файле `.env`

## Структура проекта

```
school_portal/
├── frontend/           # React приложение
│   ├── src/
│   │   ├── components/ # React компоненты
│   │   ├── pages/      # Страницы приложения
│   │   ├── services/   # Сервисы для работы с API
│   │   └── ...
│   └── package.json
├── src/                # Backend
│   ├── controllers/    # Контроллеры для обработки запросов
│   ├── routes/         # Маршруты API
│   ├── middleware/     # Middleware (auth, validation, etc.)
│   ├── utils/          # Утилиты
│   ├── config/         # Конфигурация
│   └── server.js       # Точка входа
├── prisma/
│   └── schema.prisma   # Схема базы данных
└── package.json
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

### Классы
- `GET /api/classes` - Список классов
- `POST /api/classes` - Создать класс
- `GET /api/classes/:id` - Получить класс
- `PUT /api/classes/:id` - Обновить класс
- `DELETE /api/classes/:id` - Удалить класс

### Ученики
- `GET /api/students` - Список учеников
- `POST /api/students` - Создать ученика
- `GET /api/students/:id` - Получить ученика
- `PUT /api/students/:id` - Обновить ученика
- `DELETE /api/students/:id` - Удалить ученика

### Учителя
- `GET /api/teachers` - Список учителей
- `POST /api/teachers` - Создать учителя
- `GET /api/teachers/:id` - Получить учителя
- `PUT /api/teachers/:id` - Обновить учителя
- `DELETE /api/teachers/:id` - Удалить учителя

### Оценки
- `GET /api/grades` - Список оценок
- `POST /api/grades` - Создать оценку
- `GET /api/grades/student/:studentId` - Оценки ученика
- `PUT /api/grades/:id` - Обновить оценку
- `DELETE /api/grades/:id` - Удалить оценку

### Расписание
- `GET /api/schedule` - Расписание
- `POST /api/schedule` - Создать запись в расписании
- `GET /api/schedule/class/:classId` - Расписание класса
- `PUT /api/schedule/:id` - Обновить расписание
- `DELETE /api/schedule/:id` - Удалить запись

### Администратор
- `GET /api/admin/*` - Все эндпоинты требуют роль ADMIN

## Роли пользователей

- **ADMIN** - Администратор (полный доступ)
- **TEACHER** - Учитель (может выставлять оценки, просматривать расписание)
- **STUDENT** - Ученик (может просматривать свои оценки и расписание)

## Полезные команды

- `npm run dev` - Запуск сервера в режиме разработки (с автоперезагрузкой)
- `npm start` - Запуск сервера в продакшн режиме
- `npm run stop` - Остановка сервера на порту 3000 (Windows)
- `npm run prisma:generate` - Генерация Prisma Client
- `npm run prisma:migrate` - Применение миграций к БД
- `npm run prisma:studio` - Открыть Prisma Studio для просмотра БД

## Разработка

Проект находится в активной разработке. Все изменения коммитятся в Git с подробными описаниями.

