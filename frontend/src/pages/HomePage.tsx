import { useState, useEffect, useCallback } from 'react';
import { PostList } from '../components/post/PostList';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { postEndpoints } from '../api/endpoints';
import type { Post } from '../types';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Выносим загрузку в useCallback, чтобы можно было вызывать ее вручную
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postEndpoints.getList(1, searchQuery);
      setPosts(response.data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить посты');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Загружаем посты с debounce при изменении searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchPosts]);

  // Колбэк, который вызовется в PostCard после успешного удаления
  const handlePostDeleted = () => {
    fetchPosts(); // Перезапрашиваем список с бэкенда
  };

  return (
    <div className="home-page p-4">
      <h1 className="text-2xl font-bold mb-4">Последние посты</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Поиск по постам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Показываем лоадер, пока идет загрузка */}
      {isLoading && <Loader />}

      {/* Показываем ошибку, если что-то пошло не так */}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {/* Показываем список постов, если нет загрузки и ошибок */}
      {!isLoading && !error && (
        <PostList posts={posts} onPostDeleted={handlePostDeleted} />
      )}
    </div>
  );
};