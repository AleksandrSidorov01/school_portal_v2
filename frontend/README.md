# Frontend - Школьный портал

React приложение для школьного портала.

## Технологии

- **React 19** - UI библиотека
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Tailwind CSS** - стилизация
- **Vite** - сборщик

## Установка

1. Установите зависимости:
```bash
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
```

2. Инициализируйте Tailwind CSS (если еще не сделано):
```bash
npx tailwindcss init -p
```

3. Создайте файл `.env` в папке `frontend`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

## Сборка для продакшена

```bash
npm run build
```

## Структура проекта

```
frontend/
├── src/
│   ├── components/      # React компоненты
│   │   ├── dashboard/   # Компоненты дашбордов
│   │   └── ProtectedRoute.jsx
│   ├── config/          # Конфигурация
│   │   └── api.js       # Настройка axios
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── pages/           # Страницы приложения
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/        # Сервисы для работы с API
│   │   └── auth.service.js
│   ├── App.jsx          # Главный компонент
│   └── main.jsx         # Точка входа
├── public/              # Статические файлы
└── package.json
```

## API

Frontend подключается к backend API по адресу, указанному в `VITE_API_URL`.

Все запросы автоматически включают JWT токен из localStorage.
