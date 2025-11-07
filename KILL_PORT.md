# Как остановить процесс на порту

## Способ 1: Использовать npm скрипт (рекомендуется)

### Остановить процесс на порту 3000:
```bash
npm run kill-port:3000
```

### Остановить процесс на порту 5173 (frontend):
```bash
npm run kill-port:5173
```

### Остановить процесс на любом порту:
```bash
npm run kill-port <номер_порта>
```

Пример:
```bash
npm run kill-port 8080
```

## Способ 2: Использовать PowerShell скрипт напрямую

```powershell
powershell -ExecutionPolicy Bypass -File scripts/kill-port.ps1 3000
```

## Способ 3: Использовать BAT файл

```bash
scripts\kill-port.bat 3000
```

## Способ 4: Вручную через командную строку

### Шаг 1: Найти процесс
```bash
netstat -ano | findstr :3000
```

Вы увидите что-то вроде:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       7068
```

Где `7068` - это PID процесса.

### Шаг 2: Остановить процесс
```bash
taskkill /PID 7068 /F
```

Где `7068` - это PID из предыдущего шага.

## Способ 5: Одна команда (PowerShell)

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Быстрые команды

### Остановить backend (порт 3000):
```bash
npm run kill-port:3000
```

### Остановить frontend (порт 5173):
```bash
npm run kill-port:5173
```

### Остановить оба:
```bash
npm run kill-port:3000
npm run kill-port:5173
```

## Важно

- Команда `/F` в `taskkill` означает принудительное завершение
- Процесс будет остановлен немедленно
- Убедитесь, что вы сохранили все данные перед остановкой

