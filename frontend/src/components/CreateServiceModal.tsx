'use client';

import { useState, useEffect } from 'react';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateServiceModal = ({ isOpen, onClose, onSuccess }: CreateServiceModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultConfig = `[Unit]
Description=
After=network.target

[Service]
Type=simple
ExecStart=
Restart=always

[Install]
WantedBy=multi-user.target`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('Название сервиса обязательно');
      }
      if (!config.trim()) {
        throw new Error('Конфигурация сервиса обязательна');
      }

      // Проверяем, что название заканчивается на .service
      const serviceName = name.endsWith('.service') ? name : `${name}.service`;

      // Формируем конфиг с описанием, если оно указано
      let finalConfig = config;
      if (description.trim()) {
        // Заменяем Description= на Description=описание
        finalConfig = config.replace(
          /Description=.*$/m,
          `Description=${description.trim()}`
        );
        // Если Description= отсутствует, добавляем его в секцию [Unit]
        if (!config.includes('Description=')) {
          finalConfig = finalConfig.replace(
            /(\[Unit\])/,
            `$1\nDescription=${description.trim()}`
          );
        }
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Не авторизован');

      // Используем прямой URL к backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/services/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: serviceName,
          command: finalConfig,
          description: description.trim()
        }),
        mode: 'cors',
      });
      
      if (response.status === 401) {
        // Токен невалиден - перенаправляем на логин
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Ошибка при создании сервиса');
      }

      // Сброс формы
      setName('');
      setDescription('');
      setConfig(defaultConfig);
      setError('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при создании сервиса');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setConfig(defaultConfig);
      setError('');
      onClose();
    }
  };

  // Загружаем дефолтный конфиг при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setConfig(defaultConfig);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Создать новый сервис
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название сервиса *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="myapp.service"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Будет автоматически добавлено расширение .service, если не указано
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание сервиса"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="config" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Конфигурация сервисного файла *
            </label>
            <textarea
              id="config"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder={defaultConfig}
              required
              disabled={loading}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white font-mono text-sm disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Введите содержимое systemd unit файла в формате INI
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Создание...' : 'Создать сервис'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

