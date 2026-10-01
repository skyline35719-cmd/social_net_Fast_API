import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { postEndpoints } from '../../api/endpoints';

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const { user } = useAuthStore();
  const isAuthor = user?.id === post.author.id;

  const handleDelete = async () => {
    if (confirm('Удалить пост?')) {
      try {
        await postEndpoints.delete(post.id);
        onDelete?.(); // Сообщаем родителю, что пост удален
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="group bg-white rounded-2xl shadow-soft hover:shadow-card border border-gray-100 transition-all duration-200 overflow-hidden animate-fadeIn">
      {/* ==================== ШАПКА: Аватар + автор + дата ==================== */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Link
          to={`/profile/${post.author.username}`}
          className="flex items-center gap-3 min-w-0 flex-1 group/author"
        >
          {/* Градиентный аватар с инициалом */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 group-hover/author:scale-105 transition-transform">
            {post.author.username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 group-hover/author:text-brand-600 transition-colors truncate">
              @{post.author.username}
            </p>
            <p className="text-xs text-gray-400">{formatDate(post.pub_date)}</p>
          </div>
        </Link>
      </div>

      {/* ==================== БЕЙДЖ ГРУППЫ ==================== */}
      {post.group && (
        <div className="px-5 pb-3">
          <Link
            to={`/groups/${post.group.slug}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100 transition-colors"
          >
            <span>📁</span>
            <span>{post.group.title}</span>
          </Link>
        </div>
      )}

      {/* ==================== ТЕКСТ ПОСТА ==================== */}
      <div className="px-5 pb-4">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.text}
        </p>
      </div>

      {/* ==================== КАРТИНКА ==================== */}
      {post.image && (
        <div className="px-5 pb-4">
          <img
            src={post.image}
            alt="Post attachment"
            loading="lazy"
            className="w-full rounded-xl object-cover max-h-96 bg-gray-100"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* ==================== ПОДВАЛ: Действия ==================== */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/40">
        <Link
          to={`/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium"
        >
          <span>💬</span>
          <span>Комментарии</span>
        </Link>

        {isAuthor && (
          <div className="flex items-center gap-1">
            <Link
              to={`/posts/${post.id}/edit`}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium"
            >
              Редактировать
            </Link>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    </article>
  );
};