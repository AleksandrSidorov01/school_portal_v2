# Быстрое исправление - SQLite и админ

## Шаг 1: Обновите .env файл

Создайте или обновите файл `.env` в корне проекта:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="school-portal-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

## Шаг 2: Пересоздайте базу данных

```bash
# Удалите старую базу (если была)
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue
Remove-Item -Recurse prisma/migrations -ErrorAction SilentlyContinue

# Сгенерируйте Prisma Client
npm run prisma:generate

# Создайте новую базу данных
npm run prisma:migrate
```

При запросе имени миграции введите: `init`

## Шаг 3: Создайте администратора

```bash
npm run create-admin
```

Это создаст администратора:
- Email: `admin@school.com`
- Пароль: `admin123`

Или с своими данными:
```bash
npm run create-admin admin@myschool.com mypassword123 Иван Иванов
```

## Шаг 4: Запустите серверы

**Backend:**
```bash
npm run dev
```

**Frontend (в другом терминале):**
```bash
cd frontend
npm run dev
```

## Шаг 5: Войдите в систему

1. Откройте `http://localhost:5173`
2. Войдите с данными администратора:
   - Email: `admin@school.com`
   - Пароль: `admin123`

3. Вы автоматически попадете в админ панель!

## Что изменилось

✅ База данных теперь SQLite (файл `prisma/dev.db`)  
✅ При регистрации роль всегда STUDENT  
✅ Выбор роли убран из формы регистрации  
✅ Админа можно создать через `npm run create-admin`  
✅ Не нужно устанавливать PostgreSQL  

## Регистрация обычных пользователей

1. Откройте `http://localhost:5173/register`
2. Заполните форму (без выбора роли)
3. Все новые пользователи получают роль STUDENT автоматически

