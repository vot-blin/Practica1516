const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const session = require('express-session'); // Используем express-session вместо cookie-session
const cors = require('cors'); // Добавляем CORS
const path = require('path');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(cors({
  origin: 'http://localhost:3001', // Укажите ваш фронтенд-адрес
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// Пользователи
let users = [];

// Регистрация
app.post('/register', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Логин и пароль обязательны' });
  }

  const existingUser = users.find((user) => user.login === login);
  if (existingUser) {
    return res.status(409).json({ error: 'Пользователь уже существует' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ login, password: hashedPassword });
  res.json({ success: true });
});

// Вход
app.post('/login', async (req, res) => {
  const { login, password } = req.body;

  const user = users.find((u) => u.login === login);
  if (!user) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  req.session.user = { login };
  res.json({ success: true });
});

// Выход
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка выхода' });
    }
    res.clearCookie('connect.sid'); // Очищаем куки сессии
    res.json({ success: true });
  });
});

// Профиль
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  res.json({ user: req.session.user });
});

app.get('/data', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  
  res.json({
    message: "Данные пользователя",
    user: req.session.user,
    timestamp: Date.now()
  });
});

// Статические файлы
app.use(express.static(path.join(__dirname, '../frontend')));

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});