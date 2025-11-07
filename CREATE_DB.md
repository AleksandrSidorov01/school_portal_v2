# Создание базы данных - пошаговая инструкция

## Шаг 1: Создайте файл .env

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="school-portal-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

## Шаг 2: Убедитесь, что все процессы остановлены

```bash
# Остановите все Node.js процессы
npm run kill-port:3000
npm run kill-port:5173
```

## Шаг 3: Удалите старую базу (если была)

```bash
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue
Remove-Item -Recurse prisma/migrations -ErrorAction SilentlyContinue
```

## Шаг 4: Создайте миграцию

```bash
npm run prisma:migrate
```

Когда спросит имя миграции, введите: `init`

## Шаг 5: Создайте администратора

```bash
npm run create-admin
```

## Шаг 6: Запустите серверы

**Backend:**
```bash
npm run dev
```

**Frontend (в другом терминале):**
```bash
cd frontend
npm run dev
```

## Если база данных заблокирована

1. Закройте Prisma Studio (если открыт)
2. Остановите все Node.js процессы
3. Подождите 2-3 секунды
4. Попробуйте снова

