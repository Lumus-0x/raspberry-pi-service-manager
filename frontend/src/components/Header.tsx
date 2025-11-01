'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Удаляем токен из localStorage и cookies
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  return (
    <header className="w-full bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image 
            src="/next.svg"
            alt="Logo" 
            width={32} 
            height={32}
            className="dark:invert"
          />
          <h1 className="text-xl font-semibold">Pi Service Manager</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};