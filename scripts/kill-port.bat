@echo off
REM Скрипт для остановки процесса на указанном порту
REM Использование: kill-port.bat 3000

if "%1"=="" (
    echo Ошибка: Укажите номер порта
    echo Использование: kill-port.bat ^<порт^>
    echo Пример: kill-port.bat 3000
    exit /b 1
)

echo Поиск процесса на порту %1...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%1 ^| findstr LISTENING') do (
    echo Найден процесс с PID: %%a
    echo Остановка процесса...
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 1 (
        echo Ошибка: Не удалось остановить процесс
    ) else (
        echo Процесс успешно остановлен!
    )
    goto :done
)

echo Процесс на порту %1 не найден
:done

