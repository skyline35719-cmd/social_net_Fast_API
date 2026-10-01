import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/common/Input';

export const RegisterPage = () => {
  const navigate = useNavigate();
  // Достаем функцию register и состояния из нашего стора
  const { register, isLoading, error, clearError } = useAuthStore();

  // Локальный стейт для полей формы
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Очищаем ошибку при вводе, чтобы она не висела вечно
    if (error) clearError();
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Вызываем функцию регистрации из стора
      await register(formData);
      // Если регистрация прошла успешно (не выбросило ошибку), переходим на главную
      navigate('/');
    } catch (err) {
      // Ошибка уже обработана в сторе (записана в переменную error)
      // Здесь можно оставить пустым, так как мы просто покажем error ниже
      console.error('Ошибка регистрации:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Регистрация</h1>

      {/* Показываем ошибку, если она есть */}
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
          label="Email"
          name="email"
          type="email"
          placeholder="Введите email"
          value={formData.email}
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
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-blue-500 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
};