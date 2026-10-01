import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { groupEndpoints } from '../api/endpoints';
import { PostList } from '../components/post/PostList';
import { Loader } from '../components/common/Loader';
import { CreateGroupForm } from '../components/group/CreateGroupForm';
import { useAuthStore } from '../store/authStore';
import type { Group, Post } from '../types';

export const GroupsPage = () => {
  const { slug } = useParams<{ slug?: string }>();

  // Режим 1: список групп (slug нет)
  // Режим 2: конкретная группа с постами (slug есть)
  if (slug) {
    return <GroupDetail slug={slug} />;
  }

  return <GroupsList />;
};

/* ===================== Список групп ===================== */
const GroupsList = () => {
  const { isAuthenticated } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await groupEndpoints.getList();
      setGroups(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить сообщества');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // После успешного создания — закрываем форму и перезагружаем список
  const handleGroupCreated = () => {
    setShowCreateForm(false);
    fetchGroups();
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Сообщества</h1>

        {/* Кнопка видна только авторизованным, и только если форма закрыта */}
        {isAuthenticated && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            + Создать сообщество
          </button>
        )}
      </div>

      {/* Форма создания */}
      {showCreateForm && (
        <CreateGroupForm
          onCreated={handleGroupCreated}
        />
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Сообществ пока нет.
          {isAuthenticated && ' Станьте первым, кто создаст сообщество!'}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.slug}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {group.title}
              </h2>
              {group.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {group.description}
                </p>
              )}
              <span className="text-xs text-blue-500 mt-2 inline-block">
                /{group.slug}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ===================== Детали группы ===================== */
const GroupDetail = ({ slug }: { slug: string }) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await groupEndpoints.getPosts(slug, 1);
      setGroup(response.data.group);
      setPosts(response.data.posts.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Сообщество не найдено');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (isLoading) return <Loader />;

  if (error || !group) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/groups" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Все сообщества
        </Link>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || 'Сообщество не найдено'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Хлебные крошки */}
      <Link to="/groups" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Все сообщества
      </Link>

      {/* Шапка группы */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{group.title}</h1>
        <p className="text-sm text-gray-500 mb-3">/{group.slug}</p>
        {group.description && (
          <p className="text-gray-700 whitespace-pre-wrap">{group.description}</p>
        )}
      </div>

      {/* Посты группы */}
      <h2 className="text-lg font-bold mb-4">Посты в группе</h2>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          В этом сообществе пока нет постов.
        </div>
      ) : (
        <PostList posts={posts} onPostDeleted={fetchGroup} />
      )}
    </div>
  );
};