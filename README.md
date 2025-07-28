# Lovly.dev - Personal Portfolio

## 🚀 Запуск проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск сервера
```bash
npm start
```

Или для разработки с автоперезагрузкой:
```bash
npm run dev
```

### 3. Открыть сайт
Перейдите на http://localhost:3000

## 📊 Новые функции

### ✅ База данных SQLite
- Замена localStorage на SQLite
- Автоматическое создание таблиц
- Надежное хранение данных

### ✅ GitHub API интеграция
- Автоматическое обновление статистики
- Кэширование данных (обновление каждый час)
- Реальные данные с вашего GitHub профиля

### ✅ Аналитика посещений
- Отслеживание просмотров разделов
- Статистика в админ-панели
- Популярные разделы сайта

### ✅ Node.js Backend
- Express.js сервер
- RESTful API
- CORS поддержка

## 🔧 API Endpoints

### Q&A
- `GET /api/qa` - получить все вопросы
- `POST /api/qa` - добавить вопрос
- `PUT /api/qa/:id` - обновить ответ
- `DELETE /api/qa/:id` - удалить вопрос

### GitHub
- `GET /api/github` - получить статистику GitHub

### Аналитика
- `GET /api/analytics` - получить статистику посещений
- `POST /api/analytics` - записать посещение раздела

## 📁 Структура проекта
```
lovly.dev/
├── server.js          # Node.js сервер
├── package.json       # Зависимости
├── site.db           # SQLite база данных
├── index.html        # Главная страница
├── style.css         # Стили
├── script.js         # Клиентский JavaScript
└── README.md         # Документация
```

## 🛠 Технологии
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **API**: GitHub REST API
- **Analytics**: Custom tracking system

## 🔐 Админ-панель
- Нажмите на шестеренку ⚙️ в левом нижнем углу
- Просматривайте популярные разделы
- Управляйте Q&A системой
- Отвечайте на вопросы пользователей