'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceList } from "@/components/ServiceList";
import { Header } from "@/components/Header";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Упрощенная проверка - просто проверяем наличие токена
      // Валидность токена будет проверяться при первом запросе к API
      // Если токен невалиден, пользователь будет перенаправлен на логин автоматически
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ServiceList />
      </main>
    </>
  );
}
