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

- **Backend**: Node.js + Express
- **База данных**: PostgreSQL
- **ORM**: Prisma
- **Аутентификация**: JWT
- **Валидация**: Joi

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

## Структура проекта

```
school_portal/
├── src/
│   ├── controllers/    # Контроллеры для обработки запросов
│   ├── models/         # Prisma модели (схема в prisma/schema.prisma)
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

## Разработка

Проект находится в активной разработке. Все изменения коммитятся в Git с подробными описаниями.

