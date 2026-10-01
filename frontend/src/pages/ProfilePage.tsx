import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileEndpoints } from '../api/endpoints';
import { PostList } from '../components/post/PostList';
import { FollowButton } from '../components/profile/FollowButton';
import { Loader } from '../components/common/Loader';
import { useAuthStore } from '../store/authStore';
import type { ProfileResponse } from '../types';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMyProfile = username === currentUser?.username;

  const fetchProfile = async () => {
    if (!username) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = isMyProfile
        ? await profileEndpoints.getMyProfile()
        : await profileEndpoints.getUserProfile(username);
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, isMyProfile]);

  const handleFollowChange = (isFollowing: boolean) => {
    // Обновляем локально, чтобы UI не мигал
    setProfile((prev) => (prev ? { ...prev, is_following: isFollowing } : prev));
  };

  if (isLoading) return <Loader />;

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || 'Профиль не найден'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Шапка профиля */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              @{profile.author.username}
            </h1>
            {profile.author.email && (
              <p className="text-sm text-gray-500 mt-1">{profile.author.email}</p>
            )}
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <span>
                <strong className="text-gray-800">{profile.total_posts}</strong>{' '}
                {pluralizePosts(profile.total_posts)}
              </span>
            </div>
          </div>

          {!isMyProfile && currentUser && (
            <FollowButton
              username={profile.author.username}
              initialIsFollowing={profile.is_following}
              onFollowChange={handleFollowChange}
            />
          )}

          {isMyProfile && (
            <Link
              to="/posts/create"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Создать пост
            </Link>
          )}
        </div>
      </div>

      {/* Посты пользователя */}
      <h2 className="text-lg font-bold mb-4">Посты</h2>

      {profile.posts.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          {isMyProfile
            ? 'У вас пока нет постов.'
            : 'У этого пользователя пока нет постов.'}
        </div>
      ) : (
        <PostList posts={profile.posts.items} onPostDeleted={fetchProfile} />
      )}
    </div>
  );
};

function pluralizePosts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'пост';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'поста';
  return 'постов';
}