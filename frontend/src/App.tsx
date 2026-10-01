import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { FeedPage } from './pages/FeedPage';
import { PostPage } from './pages/PostPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { EditPostPage } from './pages/EditPostPage';
import { GroupsPage } from './pages/GroupsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:slug" element={<GroupsPage />} />

          {/* Защищённые маршруты (только для авторизованных) */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <ProtectedRoute>
                <EditPostPage />
              </ProtectedRoute>
            }
          />

          {/* 404 — редирект на главную */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;