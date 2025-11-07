# СРОЧНОЕ ИСПРАВЛЕНИЕ: Ошибка таймаута базы данных

## Проблема
Ошибка: `Operations timed out after 'N/A'` - база данных SQLite не отвечает.

## Причина
База данных была создана в неправильном месте: `prisma/prisma/dev.db` вместо `prisma/dev.db`

## РЕШЕНИЕ (выполните по порядку):

### Шаг 1: Остановите ВСЕ процессы
```powershell
# Остановите Node.js процессы
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Подождите 3 секунды
Start-Sleep -Seconds 3
```

### Шаг 2: Переместите базу данных
```powershell
# Скопируйте базу данных в правильное место
if (Test-Path "prisma\prisma\dev.db") {
    Copy-Item "prisma\prisma\dev.db" "prisma\dev.db" -Force
    Write-Host "База данных скопирована в prisma/dev.db"
}

# Удалите старую папку (после копирования)
if (Test-Path "prisma\prisma") {
    Remove-Item "prisma\prisma" -Recurse -Force
}
```

### Шаг 3: Проверьте .env файл
Убедитесь, что в `.env` указан правильный путь:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Шаг 4: Перезапустите сервер
```bash
npm run dev
```

## Если проблема сохраняется

### Вариант 1: Пересоздайте базу данных
```powershell
# Удалите старую базу
Remove-Item "prisma\dev.db" -ErrorAction SilentlyContinue
Remove-Item "prisma\dev.db-journal" -ErrorAction SilentlyContinue
Remove-Item "prisma\prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Создайте новую миграцию
npm run prisma:migrate
# Введите имя: init
```

### Вариант 2: Проверьте блокировку
```powershell
# Проверьте, какие процессы используют базу данных
Get-Process | Where-Object {$_.Path -like "*prisma*"}

# Закройте Prisma Studio, если открыт
# Закройте все окна терминала
```

## Быстрое решение одной командой

```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force; Start-Sleep -Seconds 3; if (Test-Path "prisma\prisma\dev.db") { Copy-Item "prisma\prisma\dev.db" "prisma\dev.db" -Force; Remove-Item "prisma\prisma" -Recurse -Force }; Write-Host "Готово! Теперь запустите: npm run dev"
```

