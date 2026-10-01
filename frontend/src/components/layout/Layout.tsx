import React from 'react';
import { Header } from './Header'; // Если Header.tsx существует

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-4 text-center text-gray-500">
        © 2024 Social App. Все права защищены.
      </footer>
    </div>
  );
};