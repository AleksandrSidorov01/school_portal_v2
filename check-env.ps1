# Проверка .env файла
Write-Host "Проверка конфигурации..." -ForegroundColor Cyan

if (Test-Path ".env") {
    Write-Host "`n=== Содержимое .env ===" -ForegroundColor Yellow
    Get-Content ".env"
    
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch 'DATABASE_URL="file:\./prisma/dev\.db"') {
        Write-Host "`n⚠️  DATABASE_URL может быть неправильным!" -ForegroundColor Red
        Write-Host "Должно быть: DATABASE_URL=`"file:./prisma/dev.db`"" -ForegroundColor Yellow
    } else {
        Write-Host "`n✅ DATABASE_URL настроен правильно" -ForegroundColor Green
    }
} else {
    Write-Host "`n❌ Файл .env не найден!" -ForegroundColor Red
    Write-Host "Создайте файл .env со следующим содержимым:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=`"file:./prisma/dev.db`""
    Write-Host "JWT_SECRET=`"school-portal-secret-key-change-in-production`""
    Write-Host "JWT_EXPIRES_IN=`"7d`""
    Write-Host "PORT=3000"
    Write-Host "NODE_ENV=development"
}

