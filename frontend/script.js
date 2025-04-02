document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', theme);
  if (window.location.pathname.endsWith('/profile.html')) {
    checkAuth();
  }
});

document.getElementById('authForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await login();
});

async function login() {
  try {
      const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          credentials: 'include', // Важно для кук!
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              login: document.getElementById('login').value,
              password: document.getElementById('password').value,
          }),
      });

      const data = await response.json();
      
      if (data.success) {
          window.location.href = 'profile.html';
      } else {
          alert(data.error || 'Ошибка авторизации');
      }
  } catch (error) {
      console.error('Login error:', error);
      alert('Сервер не отвечает');
  }
}

async function register() {
  try {
      const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              login: document.getElementById('login').value,
              password: document.getElementById('password').value,
          }),
      });

      const data = await response.json();
      alert(data.success ? 'Успешная регистрация' : data.error || 'Ошибка');
  } catch (error) {
      console.error('Register error:', error);
      alert('Ошибка соединения');
  }
}

async function checkAuth() {
  try {
      const response = await fetch('http://localhost:3000/profile', {
          credentials: 'include'
      });

      if (response.status === 401) {
          window.location.href = 'index.html';
          return;
      }

      const data = await response.json();
      if (data.user) {
          document.getElementById('username').textContent = data.user.login;
      }
  } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = 'index.html';
  }
}

async function logout() {
  try {
      await fetch('http://localhost:3000/logout', {
          method: 'POST',
          credentials: 'include'
      });
      window.location.href = 'index.html';
  } catch (error) {
      console.error('Logout error:', error);
  }
}

async function fetchData() {
  try {
    const response = await fetch('http://localhost:3000/data', {
      credentials: 'include'
    });
    
    const data = await response.json();
    document.getElementById('data').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Data fetch error:', error);
    document.getElementById('data').textContent = error.message;
  }
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}