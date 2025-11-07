# API Endpoints - Правильные URL

## ⚠️ Важно!

**НЕ открывайте** `http://localhost:3000/api/` - такого маршрута нет!

## ✅ Правильные URL для проверки

### Проверка работы Backend
```
http://localhost:3000/api/health
```
Должен вернуться:
```json
{"status":"ok","message":"Школьный портал работает!"}
```

### Аутентификация
```
POST http://localhost:3000/api/auth/register
POST http://localhost:3000/api/auth/login
GET  http://localhost:3000/api/auth/me
```

### Классы
```
GET    http://localhost:3000/api/classes
POST   http://localhost:3000/api/classes
GET    http://localhost:3000/api/classes/:id
PUT    http://localhost:3000/api/classes/:id
DELETE http://localhost:3000/api/classes/:id
```

### Ученики
```
GET    http://localhost:3000/api/students
POST   http://localhost:3000/api/students
GET    http://localhost:3000/api/students/:id
PUT    http://localhost:3000/api/students/:id
DELETE http://localhost:3000/api/students/:id
```

### Учителя
```
GET    http://localhost:3000/api/teachers
POST   http://localhost:3000/api/teachers
GET    http://localhost:3000/api/teachers/:id
PUT    http://localhost:3000/api/teachers/:id
DELETE http://localhost:3000/api/teachers/:id
```

### Оценки
```
GET    http://localhost:3000/api/grades
POST   http://localhost:3000/api/grades
GET    http://localhost:3000/api/grades/student/:studentId
GET    http://localhost:3000/api/grades/:id
PUT    http://localhost:3000/api/grades/:id
DELETE http://localhost:3000/api/grades/:id
```

### Расписание
```
GET    http://localhost:3000/api/schedule
POST   http://localhost:3000/api/schedule
GET    http://localhost:3000/api/schedule/class/:classId
GET    http://localhost:3000/api/schedule/:id
PUT    http://localhost:3000/api/schedule/:id
DELETE http://localhost:3000/api/schedule/:id
```

### Админ панель
```
GET    http://localhost:3000/api/admin/statistics
GET    http://localhost:3000/api/admin/users
POST   http://localhost:3000/api/admin/users
DELETE http://localhost:3000/api/admin/users/:id
GET    http://localhost:3000/api/admin/subjects
POST   http://localhost:3000/api/admin/subjects
DELETE http://localhost:3000/api/admin/subjects/:id
```

## 🌐 Frontend URL

**Frontend работает на другом порту:**
```
http://localhost:5173
```

**НЕ открывайте:**
- ❌ `http://localhost:3000/api/` - такого маршрута нет!
- ❌ `http://localhost:3000/` - это backend, не frontend

**Открывайте:**
- ✅ `http://localhost:5173` - это frontend приложение
- ✅ `http://localhost:3000/api/health` - проверка backend

## 🔍 Как проверить, что все работает

1. **Backend:**
   - Откройте: `http://localhost:3000/api/health`
   - Должен вернуться JSON с сообщением

2. **Frontend:**
   - Откройте: `http://localhost:5173`
   - Должна открыться страница входа или дашборд

3. **Связь Frontend ↔ Backend:**
   - Frontend автоматически обращается к `http://localhost:3000/api/*`
   - Проверьте файл `.env` в папке `frontend`: `VITE_API_URL=http://localhost:3000/api`

