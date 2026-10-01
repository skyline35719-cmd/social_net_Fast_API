import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postEndpoints, commentEndpoints } from '../api/endpoints';
import { PostCard } from '../components/post/PostCard';
import { Loader } from '../components/common/Loader';
import { useAuthStore } from '../store/authStore';
import type { Post, Comment } from '../types';

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [post, setPost] = useState<(Post & { comments: Comment[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Стейт для формы комментария
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Загрузка поста
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await postEndpoints.getDetail(Number(id));
        setPost(response.data.post);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Не удалось загрузить пост');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Отправка комментария
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;

    setIsSubmitting(true);
    setCommentError(null);
    try {
      const response = await commentEndpoints.add(Number(id), { text: commentText });
      // Добавляем новый комментарий к посту локально, чтобы не перезапрашивать
      setPost((prev) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), response.data] }
          : null
      );
      setCommentText('');
    } catch (err: any) {
      setCommentError(err.response?.data?.detail || 'Не удалось добавить комментарий');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Когда пост удалён — уходим на главную
  const handlePostDeleted = () => {
    navigate('/');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500 hover:underline"
        >
          ← Назад
        </button>
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const commentsCount = post.comments?.length || 0;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline font-medium"
      >
        ← Назад
      </button>

      {/* Сам пост */}
      <PostCard post={post} onDelete={handlePostDeleted} />

      {/* Секция комментариев */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">
          Комментарии ({commentsCount})
        </h2>

        {/* Форма добавления комментария */}
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            {commentError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
                {commentError}
              </div>
            )}
            <textarea
              value={commentText}
              onChange={(e) => {
                if (commentError) setCommentError(null);
                setCommentText(e.target.value);
              }}
              placeholder="Написать комментарий..."
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        ) : (
          <div className="mb-6 text-gray-600 text-sm bg-gray-50 p-3 rounded">
            <Link to="/login" className="text-blue-500 hover:underline font-medium">
              Войдите
            </Link>
            , чтобы оставить комментарий.
          </div>
        )}

        {/* Список комментариев */}
        {commentsCount > 0 ? (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="border-t border-gray-100 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <Link
                    to={`/profile/${comment.author.username}`}
                    className="font-medium text-blue-600 hover:underline text-sm"
                  >
                    @{comment.author.username}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.pub_date).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-6">
            Комментариев пока нет. Будьте первым!
          </div>
        )}
      </div>
    </div>
  );
};