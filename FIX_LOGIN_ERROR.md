# ИСПРАВЛЕНИЕ: Ошибка "Unable to open the database file" при входе

## Проблема
Ошибка: `Error code 14: Unable to open the database file` - база данных не может быть открыта.

## Причина
Скорее всего, в файле `.env` указан неправильный путь к базе данных или файл `.env` отсутствует.

## БЫСТРОЕ РЕШЕНИЕ:

### Шаг 1: Остановите сервер
Нажмите `Ctrl+C` в терминале, где запущен сервер, или:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Шаг 2: Проверьте/создайте файл .env

**Создайте или откройте файл `.env` в корне проекта** и убедитесь, что там указано:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="school-portal-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

**ВАЖНО:** 
- Путь должен быть `file:./prisma/dev.db` (с точкой и слешем)
- НЕ используйте `file:./prisma/prisma/dev.db` (двойной путь)
- НЕ используйте абсолютные пути

### Шаг 3: Перезапустите сервер

```bash
npm run dev
```

### Шаг 4: Проверьте логи

При запуске сервера вы должны увидеть:
```
✅ Подключение к базе данных установлено
```

Если видите ошибку, проверьте:
1. Существует ли файл `prisma/dev.db`
2. Правильно ли указан путь в `.env`
3. Нет ли других процессов, использующих базу данных

## Если проблема сохраняется:

### Вариант 1: Пересоздайте базу данных

```powershell
# Остановите сервер
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Удалите базу данных
Remove-Item "prisma\dev.db" -ErrorAction SilentlyContinue
Remove-Item "prisma\dev.db-journal" -ErrorAction SilentlyContinue

# Создайте новую миграцию
npm run prisma:migrate
# Введите имя: init
```

### Вариант 2: Проверьте путь вручную

1. Откройте файл `.env` в редакторе
2. Убедитесь, что строка `DATABASE_URL` выглядит так:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```
3. Сохраните файл
4. Перезапустите сервер

## Проверка после исправления:

1. Запустите сервер: `npm run dev`
2. Откройте браузер: `http://localhost:5173`
3. Попробуйте войти - ошибка должна исчезнуть

