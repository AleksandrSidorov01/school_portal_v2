# Инструкция по настройке Frontend

## Шаг 1: Установка зависимостей

Перейдите в папку `frontend` и установите зависимости:

```bash
cd frontend
npm install
```

Затем установите дополнительные пакеты:

```bash
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
```

## Шаг 2: Инициализация Tailwind CSS

Если Tailwind еще не инициализирован, выполните:

```bash
npx tailwindcss init -p
```

**Примечание:** Конфигурационные файлы `tailwind.config.js` и `postcss.config.js` уже созданы, этот шаг можно пропустить.

## Шаг 3: Настройка переменных окружения

Создайте файл `.env` в папке `frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Шаг 4: Запуск Frontend

Убедитесь, что backend сервер запущен на порту 3000, затем:

```bash
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173`

## Структура проекта

```
frontend/
├── src/
│   ├── components/          # React компоненты
│   │   ├── dashboard/       # Компоненты дашбордов
│   │   └── ProtectedRoute.jsx
│   ├── config/              # Конфигурация
│   │   └── api.js           # Настройка axios
│   ├── context/             # React Context
│   │   └── AuthContext.jsx   # Контекст аутентификации
│   ├── pages/               # Страницы приложения
│   │   ├── Login.jsx        # Страница входа
│   │   ├── Register.jsx     # Страница регистрации
│   │   └── Dashboard.jsx    # Главная панель
│   ├── services/            # Сервисы для работы с API
│   │   └── auth.service.js  # Сервис аутентификации
│   ├── App.jsx              # Главный компонент с роутингом
│   └── main.jsx             # Точка входа
└── package.json
```

## Что уже реализовано

✅ Настройка React + Vite  
✅ Роутинг (React Router)  
✅ Контекст аутентификации (AuthContext)  
✅ Страница входа (Login)  
✅ Страница регистрации (Register)  
✅ Защищенные маршруты (ProtectedRoute)  
✅ Базовые дашборды для всех ролей:
   - Панель студента
   - Панель учителя
   - Панель администратора
✅ Интеграция с Backend API (axios)
✅ Tailwind CSS для стилизации

## Следующие шаги

1. Реализовать функционал просмотра оценок для студентов
2. Реализовать функционал выставления оценок для учителей
3. Реализовать управление классами, учениками, учителями для администратора
4. Добавить просмотр расписания
5. Улучшить UI/UX

## Решение проблем

### Ошибка при установке зависимостей

Если возникает ошибка с `patch-package`, попробуйте:

```bash
npm install --legacy-peer-deps
```

Или установите зависимости по одной:

```bash
npm install react-router-dom
npm install axios
npm install -D tailwindcss
npm install -D postcss
npm install -D autoprefixer
```

### Порт 5173 занят

Измените порт в `vite.config.js` или используйте флаг:

```bash
npm run dev -- --port 3001
```

