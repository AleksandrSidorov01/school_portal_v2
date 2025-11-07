# Исправление ошибки таймаута базы данных

## Проблема
Ошибка: `Operations timed out after 'N/A'` при работе с SQLite базой данных.

## Причины
1. База данных заблокирована другим процессом
2. Неправильный путь к базе данных
3. База данных повреждена
4. Слишком короткий timeout для операций

## Решения

### 1. Проверьте, что база не заблокирована

**Остановите все процессы:**
```powershell
# Остановите сервер
npm run kill-port:3000

# Закройте Prisma Studio (если открыт)
# Проверьте процессы Node.js
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### 2. Проверьте путь к базе данных

Убедитесь, что в файле `.env` указан правильный путь:
```env
DATABASE_URL="file:./prisma/dev.db"
```

**НЕ используйте:**
- `file:./prisma/prisma/dev.db` (двойной путь)
- `file:./dev.db` (неправильный путь)

### 3. Перезапустите сервер

```bash
# Остановите все процессы
npm run kill-port:3000

# Подождите 2-3 секунды

# Запустите снова
npm run dev
```

### 4. Если проблема сохраняется

**Вариант A: Пересоздайте базу данных**

```powershell
# Остановите сервер
npm run kill-port:3000

# Удалите базу данных
Remove-Item prisma\dev.db -ErrorAction SilentlyContinue
Remove-Item prisma\dev.db-journal -ErrorAction SilentlyContinue

# Создайте новую миграцию
npm run prisma:migrate
# Введите имя: init
```

**Вариант B: Проверьте файл базы данных**

```powershell
# Проверьте размер файла
Get-Item prisma\dev.db | Select-Object Name, Length

# Если файл очень маленький (< 1 KB) или поврежден, удалите и пересоздайте
```

### 5. Увеличьте timeout (если нужно)

Если проблема в медленных операциях, можно увеличить timeout в `src/config/database.js`:

```javascript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## Быстрое решение

1. **Остановите все процессы:**
   ```powershell
   npm run kill-port:3000
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
   ```

2. **Подождите 3 секунды**

3. **Проверьте .env файл:**
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

4. **Перезапустите сервер:**
   ```bash
   npm run dev
   ```

## Если ничего не помогает

1. Закройте все окна терминала
2. Закройте Prisma Studio (если открыт)
3. Перезапустите компьютер (если возможно)
4. Пересоздайте базу данных (см. Вариант A выше)

