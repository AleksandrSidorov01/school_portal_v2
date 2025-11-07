# Инструкция по настройке проекта

## Требования

- Node.js (версия 18 или выше)
- PostgreSQL (версия 12 или выше)
- npm или yarn

## Шаги установки

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

1. Создайте базу данных PostgreSQL:
```sql
CREATE DATABASE school_portal;
```

2. Создайте файл `.env` в корне проекта:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_portal?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

3. Если у вас другой пароль для PostgreSQL, замените `postgres:postgres` на `ваш_пользователь:ваш_пароль` в DATABASE_URL.

### 3. Настройка Prisma

1. Сгенерируйте Prisma Client:
```bash
npm run prisma:generate
```

2. Примените миграции к базе данных:
```bash
npm run prisma:migrate
```

### 4. Запуск сервера

Для разработки (с автоперезагрузкой):
```bash
npm run dev
```

Для продакшена:
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3000`

## Проверка работы

Откройте в браузере или используйте curl:
```bash
curl http://localhost:3000/api/health
```

Должен вернуться ответ:
```json
{
  "status": "ok",
  "message": "Школьный портал работает!"
}
```

## Создание первого администратора

После запуска миграций, вы можете создать первого администратора через API:

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "admin@school.com",
  "password": "admin123",
  "firstName": "Администратор",
  "lastName": "Системы",
  "role": "ADMIN"
}
```

Затем создайте профиль учителя для этого пользователя через админ-панель.

## Использование Prisma Studio

Для просмотра и редактирования данных в базе данных:
```bash
npm run prisma:studio
```

Откроется веб-интерфейс по адресу `http://localhost:5555`

## Структура API

Все API endpoints требуют аутентификации (кроме `/api/auth/register` и `/api/auth/login`).

Добавьте заголовок:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Следующие шаги

1. Настройте frontend (React, Vue или другой фреймворк)
2. Добавьте дополнительные функции (уведомления, отчеты и т.д.)
3. Настройте CI/CD для автоматического развертывания
4. Добавьте тесты

