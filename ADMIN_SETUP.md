# Создание администратора

## Способ 1: Через скрипт (рекомендуется)

### Базовое использование (с дефолтными данными):
```bash
npm run create-admin
```

Создаст администратора:
- Email: `admin@school.com`
- Пароль: `admin123`
- Имя: `Администратор`
- Фамилия: `Системы`

### Свои данные:
```bash
npm run create-admin <email> <password> <firstName> <lastName>
```

Пример:
```bash
npm run create-admin admin@myschool.com mypassword123 Иван Иванов
```

## Способ 2: Через Prisma Studio

1. Запустите Prisma Studio:
```bash
npm run prisma:studio
```

2. Откройте `http://localhost:5555` в браузере

3. Перейдите в таблицу `User`

4. Создайте нового пользователя:
   - Email: ваш email
   - Password: захешированный пароль (используйте bcrypt)
   - firstName: ваше имя
   - lastName: ваша фамилия
   - role: `ADMIN`

## Вход в админ панель

1. Откройте frontend: `http://localhost:5173`

2. Войдите с данными администратора:
   - Email: `admin@school.com` (или тот, который вы указали)
   - Пароль: `admin123` (или тот, который вы указали)

3. После входа вы автоматически попадете в админ панель

## Доступ к админ панели

Админ панель доступна по адресу:
```
http://localhost:5173/dashboard
```

(Если вы вошли как администратор, откроется админ панель)

## API эндпоинты для админа

Все эндпоинты `/api/admin/*` требуют роль ADMIN:
- `GET /api/admin/statistics` - статистика системы
- `GET /api/admin/users` - список всех пользователей
- `POST /api/admin/users` - создание пользователя
- `DELETE /api/admin/users/:id` - удаление пользователя
- `GET /api/admin/subjects` - список предметов
- `POST /api/admin/subjects` - создание предмета
- `DELETE /api/admin/subjects/:id` - удаление предмета

## Важно

- Администратор может создавать других пользователей через админ панель
- Регистрация через `/register` всегда создает пользователей с ролью STUDENT
- Админов можно создать только через скрипт или Prisma Studio

