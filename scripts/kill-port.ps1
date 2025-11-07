# Скрипт для остановки процесса на указанном порту

param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "Поиск процесса на порту $Port..." -ForegroundColor Yellow

$process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1

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
    Write-Host "ℹ️ Процесс на порту $Port не найден" -ForegroundColor Cyan
}

