import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [urls, setUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleRegister = async (username, password, fullName) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setUser(data);
      handleLogin(username, password); // Auto login after registration
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setToken(data.access_token);
      fetchUserData(data.access_token);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUserData = async (accessToken) => {
    try {
      const response = await fetch('http://localhost:8000/api/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setUser(data);
      fetchUrls(accessToken);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUrls = async (accessToken, page = 1) => {
    try {
      const response = await fetch(`http://localhost:8000/api/me/urls?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setUrls(data);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const createShortUrl = async (url) => {
    try {
      const response = await fetch('http://localhost:8000/api/me/urls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      fetchUrls(token, currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

    return (
    <div className="app">
      <h1>URL Shortener</h1>

      {error && (
        <div className="error-message">
          <AlertCircle />
          <span>{error}</span>
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {!user ? (
        <div className="auth-container">
          <LoginForm onLogin={handleLogin} />
          <RegisterForm onRegister={handleRegister} />
        </div>
      ) : (
        <div className="dashboard">
          <div className="welcome-card">
            <div>
              <h2>Добридень, {user.username}!</h2>
              <p>Ви створили {user.links} URL-посилань за весь час.</p>
            </div>
            <button
              onClick={() => { setUser(null); setToken(''); }}
              className="logout-button"
            >
              Вийти
            </button>
          </div>

          <CreateUrlForm onSubmit={createShortUrl} />

          <UrlList
            urls={urls}
            currentPage={currentPage}
            onPageChange={(page) => fetchUrls(token, page)}
            totalUrls={user.links}
          />
        </div>
      )}
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Логін</h2>
      <div className="form-group">
        <label>Ім'я користувача</label>
        <input
          type="text"
          placeholder="Введіть своє ім'я користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          placeholder="Введіть пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <button type="submit" className="auth-button login-button">
        Увійти
      </button>
    </form>
  );
};

const RegisterForm = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(username, password, fullName);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Реєстрація</h2>
      <div className="form-group">
        <label>Ім'я користувача</label>
        <input
          type="text"
          placeholder="Зазначте своє ім'я користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          placeholder="Створіть пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label>Повне ім'я (опціонально)</label>
        <input
          type="text"
          placeholder="Введіть своє повне ім'я"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="form-input"
        />
      </div>
      <button type="submit" className="auth-button register-button">
        Створити акаунт
      </button>
    </form>
  );
};

const CreateUrlForm = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="url-form">
      <h2>Скоротити URL-посилання</h2>
      <div className="url-form-container">
        <input
          type="url"
          placeholder="Введіть URL-посилання, яке ви хочете скоротити"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
          required
        />
        <button type="submit" className="shorten-button">
          Скоротити
        </button>
      </div>
    </form>
  );
};

const UrlList = ({ urls, currentPage, onPageChange, totalUrls }) => {
  const totalPages = Math.ceil(totalUrls / 10);

  return (
    <div className="url-list">
      <h2>Ваші URL-посилання</h2>
      <div>
        {urls.map((url) => (
          <div key={url.short} className="url-item">
            <div className="url-details">
              <div>
                <p>Оригінальна URL: {url.url}</p>
                <p>Скорочена URL: {window.location.origin}/{url.short}</p>
                <p>Кліків: {url.redirects}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${url.short}`)}
                className="copy-button"
              >
                Копіювати URL
              </button>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`page-button ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;