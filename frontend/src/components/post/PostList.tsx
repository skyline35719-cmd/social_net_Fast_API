import React from 'react';
import { PostCard } from './PostCard';
import type { Post } from '../../types';

interface PostListProps {
  posts: Post[];
  onPostDeleted?: () => void; // Колбэк, который вызывается после удаления поста
}

export const PostList: React.FC<PostListProps> = ({ posts, onPostDeleted }) => {
  // Заглушка, если постов пока нет
  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Постов пока нет.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDelete={onPostDeleted} // Пробрасываем колбэк в карточку
        />
      ))}
    </div>
  );
};