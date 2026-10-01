import React, { useState } from 'react';
import { profileEndpoints } from '../../api/endpoints';

interface FollowButtonProps {
  username: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  username,
  initialIsFollowing = false,
  onFollowChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isFollowing) {
        await profileEndpoints.unfollow(username);
      } else {
        await profileEndpoints.follow(username);
      }
      const newState = !isFollowing;
      setIsFollowing(newState);
      onFollowChange?.(newState);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isLoading ? '...' : isFollowing ? 'Отписаться' : 'Подписаться'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};