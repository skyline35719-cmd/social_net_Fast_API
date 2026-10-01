import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PostList } from '../components/post/PostList';
import { Loader } from '../components/common/Loader';
import { postEndpoints } from '../api/endpoints';
import type { Post } from '../types';

export const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postEndpoints.getFollowFeed(1);
      setPosts(response.data.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить ленту');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Обновление после удаления поста
  const handlePostDeleted = () => {
    fetchFeed();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Моя лента</h1>
        <button
          onClick={fetchFeed}
          disabled={isLoading}
          className="text-sm text-blue-500 hover:text-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Обновление...' : 'Обновить'}
        </button>
      </div>

      {isLoading && posts.length === 0 && <Loader />}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">
            В вашей ленте пока нет постов.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Подпишитесь на других пользователей, чтобы видеть их посты здесь.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Найти интересных авторов
          </Link>
        </div>
      )}

      {!error && posts.length > 0 && (
        <PostList posts={posts} onPostDeleted={handlePostDeleted} />
      )}
    </div>
  );
};