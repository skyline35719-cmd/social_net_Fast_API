import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postEndpoints, groupEndpoints } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { Loader } from '../components/common/Loader';
import type { Group, PostCreate } from '../types';

export const EditPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [formData, setFormData] = useState<PostCreate>({
    text: '',
    image: '',
    group_id: undefined,
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем пост + список групп
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        // Загружаем группы (не критично, если не получится)
        try {
          const groupsResponse = await groupEndpoints.getList();
          setGroups(groupsResponse.data);
        } catch {
          // Игнорируем — селект просто не покажется
        }

        // Загружаем пост
        const postResponse = await postEndpoints.getDetail(Number(id));
        // ИСПРАВЛЕНО: берем .post, потому что бэкенд возвращает обертку
        const post = postResponse.data.post;

        // Проверка авторства
        if (currentUser && post.author.id !== currentUser.id) {
          setError('Вы не можете редактировать чужой пост');
          setIsLoading(false);
          return;
        }

        // Предзаполняем форму
        setFormData({
          text: post.text,
          image: post.image || '',
          group_id: post.group?.id,
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Не удалось загрузить пост');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (error) setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'group_id' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: PostCreate = { text: formData.text };
      if (formData.image) payload.image = formData.image;
      if (formData.group_id) payload.group_id = formData.group_id;

      await postEndpoints.update(Number(id), payload);
      navigate(`/posts/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось сохранить изменения');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-6">Редактировать пост</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        {/* Текст */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Текст поста <span className="text-red-500">*</span>
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>

        {/* Картинка */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            URL картинки (опционально)
          </label>
          <input
            id="image"
            name="image"
            type="url"
            value={formData.image || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Группа */}
        {groups.length > 0 && (
          <div>
            <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 mb-1">
              Группа (опционально)
            </label>
            <select
              id="group_id"
              name="group_id"
              value={formData.group_id ?? ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Без группы —</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !formData.text.trim()}
            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};