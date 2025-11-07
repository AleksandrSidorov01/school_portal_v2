# Скрипт для остановки сервера на порту 3000

Write-Host "Поиск процесса на порту 3000..." -ForegroundColor Yellow

$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

if ($process) {
    $processInfo = Get-Process -Id $process -ErrorAction SilentlyContinue
    if ($processInfo) {
        Write-Host "Найден процесс: $($processInfo.ProcessName) (PID: $process)" -ForegroundColor Cyan
        Write-Host "Остановка процесса..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force
        Write-Host "✅ Процесс успешно остановлен!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Процесс не найден" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️ Процесс на порту 3000 не найден" -ForegroundColor Cyan
}

