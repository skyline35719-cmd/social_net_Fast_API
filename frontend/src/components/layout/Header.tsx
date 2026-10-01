import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Стиль активной/неактивной ссылки
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-600'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold text-gray-900">
            Social Network
          </span>
        </Link>

        {/* Навигация */}
        <nav className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <NavLink to="/feed" className={linkClass}>
                Лента
              </NavLink>
              <NavLink to="/groups" className={linkClass}>
                Сообщества
              </NavLink>
              <NavLink to="/posts/create" className={linkClass}>
                Создать пост
              </NavLink>

              {/* Правая часть: пользователь + выход */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
                {user && (
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Аватар с инициалом */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      @{user.username}
                    </span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium px-2 py-1.5"
                >
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Войти
              </NavLink>
              <Link
                to="/register"
                className="ml-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};