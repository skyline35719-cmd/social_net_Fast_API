import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/common/Input';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Куда редиректить после логина. Если пользователя перекинуло с /feed — вернем его туда
  const from = (location.state as any)?.from?.pathname || '/';

  // Если пользователь уже залогинен — редирект (например, при F5)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError(); // Убираем старую ошибку при вводе
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      // Ошибка уже записана в стор, отображаем ее ниже
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Вход</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Имя пользователя"
          name="username"
          type="text"
          placeholder="Введите username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <Input
          label="Пароль"
          name="password"
          type="password"
          placeholder="Введите пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Нет аккаунта?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
};