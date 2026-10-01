import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postEndpoints, groupEndpoints } from '../api/endpoints';
import type { Group, PostCreate } from '../types';

export const CreatePostPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PostCreate>({
    text: '',
    image: '',
    group_id: undefined,
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем список групп для селекта (если пользователь хочет привязать пост к группе)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupEndpoints.getList();
        setGroups(response.data);
      } catch (err) {
        // Не критично, если группы не загрузятся — просто не покажем селект
        console.error('Failed to load groups:', err);
      }
    };
    fetchGroups();
  }, []);

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
    setIsLoading(true);
    setError(null);

    try {
      // Готовим данные: убираем пустые поля
      const payload: PostCreate = {
        text: formData.text,
      };
      if (formData.image) payload.image = formData.image;
      if (formData.group_id) payload.group_id = formData.group_id;

      const response = await postEndpoints.create(payload);

      // После успешного создания — редирект на страницу нового поста
      navigate(`/posts/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать пост');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Создать пост</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Текст поста */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Текст поста <span className="text-red-500">*</span>
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="О чём вы думаете?"
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>

        {/* URL картинки */}
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

        {/* Группа (если есть загруженные группы) */}
        {groups.length > 0 && (
          <div>
            <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 mb-1">
              Опубликовать в группе (опционально)
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
            disabled={isLoading || !formData.text.trim()}
            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Публикация...' : 'Опубликовать'}
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