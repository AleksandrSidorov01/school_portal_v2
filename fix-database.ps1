# Скрипт для исправления базы данных

Write-Host "🔧 Исправление базы данных..." -ForegroundColor Cyan

# 1. Остановить все Node.js процессы
Write-Host "`n1. Остановка Node.js процессов..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Процессы остановлены" -ForegroundColor Green

# 2. Проверить существование базы данных
Write-Host "`n2. Проверка базы данных..." -ForegroundColor Yellow
$dbPath = "prisma\dev.db"
$dbPathOld = "prisma\prisma\dev.db"

if (Test-Path $dbPathOld) {
    Write-Host "⚠️  Найдена база данных в неправильном месте: $dbPathOld" -ForegroundColor Yellow
    if (-not (Test-Path $dbPath)) {
        Copy-Item $dbPathOld $dbPath -Force
        Write-Host "✅ База данных скопирована в правильное место" -ForegroundColor Green
    }
    Remove-Item "prisma\prisma" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Удалена лишняя папка" -ForegroundColor Green
}

if (Test-Path $dbPath) {
    $db = Get-Item $dbPath
    Write-Host "✅ База данных найдена: $($db.FullName)" -ForegroundColor Green
    Write-Host "   Размер: $($db.Length) байт" -ForegroundColor Gray
} else {
    Write-Host "❌ База данных НЕ найдена!" -ForegroundColor Red
    Write-Host "   Нужно создать миграцию: npm run prisma:migrate" -ForegroundColor Yellow
}

# 3. Проверить .env файл
Write-Host "`n3. Проверка .env файла..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match 'DATABASE_URL="file:\./prisma/dev\.db"') {
        Write-Host "✅ DATABASE_URL настроен правильно" -ForegroundColor Green
    } else {
        Write-Host "⚠️  DATABASE_URL может быть неправильным" -ForegroundColor Yellow
        Write-Host "   Убедитесь, что в .env указано: DATABASE_URL=`"file:./prisma/dev.db`"" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Файл .env не найден!" -ForegroundColor Red
    Write-Host "   Создайте файл .env с содержимым:" -ForegroundColor Yellow
    Write-Host "   DATABASE_URL=`"file:./prisma/dev.db`"" -ForegroundColor Gray
}

# 4. Проверить права доступа
Write-Host "`n4. Проверка прав доступа..." -ForegroundColor Yellow
if (Test-Path $dbPath) {
    try {
        $testFile = [System.IO.File]::Open($dbPath, 'Open', 'ReadWrite', 'None')
        $testFile.Close()
        Write-Host "✅ Права доступа в порядке" -ForegroundColor Green
    } catch {
        Write-Host "❌ Нет прав доступа к базе данных!" -ForegroundColor Red
        Write-Host "   Ошибка: $_" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Готово! Теперь запустите: npm run dev" -ForegroundColor Cyan

