import React, { useState } from 'react';
import { groupEndpoints } from '../../api/endpoints';
import type { GroupCreate } from '../../types';

interface Props {
  onCreated?: () => void;
}

export const CreateGroupForm = ({ onCreated }: Props) => {
  const [formData, setFormData] = useState<GroupCreate>({
    title: '',
    description: '',
    slug: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (error) setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: GroupCreate = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };
      if (formData.slug?.trim()) {
        payload.slug = formData.slug.trim();
      }

      await groupEndpoints.create(payload);

      // Очищаем форму и сообщаем родителю об успехе
      setFormData({ title: '', description: '', slug: '' });
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось создать сообщество');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white p-6 rounded-2xl shadow-soft border border-gray-100 animate-fadeIn"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
          <span className="text-white text-sm">📁</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Новое сообщество</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Название */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Название <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={200}
          placeholder="Например: Программирование на Python"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Описание */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Описание <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          placeholder="О чём это сообщество?"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-vertical placeholder:text-gray-400"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
          URL-адрес <span className="text-gray-400 font-normal">(опционально)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
            /groups/
          </span>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug || ''}
            onChange={handleChange}
            placeholder="auto-generated"
            className="w-full pl-20 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          Только латиница, цифры и дефисы. Если не указать — сгенерируется из названия.
        </p>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
          className="flex-1 bg-brand-500 text-white py-2.5 rounded-xl hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {isSubmitting ? 'Создание...' : 'Создать сообщество'}
        </button>
        {onCreated && (
          <button
            type="button"
            onClick={onCreated}
            className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
};