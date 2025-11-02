'use client';

import { useEffect, useState } from 'react';
import { ServiceItem } from './ServiceItem';
import { CreateServiceModal } from './CreateServiceModal';

interface Service {
  name: string;
  status: string;
  enabled: boolean | string;
  description: string;
  details: string;
}

type SortField = 'name' | 'status' | 'enabled' | 'description';
type SortOrder = 'asc' | 'desc';

export const ServiceList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      // Используем прямой URL к backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
        if (errorData && errorData.message) {
          throw new Error(`Failed to fetch services: ${errorData.message}`);
        } else {
          throw new Error(`Failed to fetch services: ${response.statusText}`);
        }
      }

      const data = await response.json();
      if (!Array.isArray(data.services)) {
        throw new Error('Invalid response format');
      }
      setServices(data.services);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = async (name: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      // Используем прямой URL к backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Для delete используем отдельный endpoint
      const endpoint = action === 'delete' ? '/services/delete' : '/services/control';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, action }),
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
        if (errorData && errorData.message) {
          throw new Error(`Failed to ${action} service: ${errorData.message}`);
        } else if (errorData && errorData.detail) {
          throw new Error(`Failed to ${action} service: ${errorData.detail}`);
        } else {
          throw new Error(`Failed to ${action} service: ${response.statusText}`);
        }
      }
      // Обновляем список после успешного действия
      await fetchServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Функция сортировки сервисов
  const sortServices = (servicesToSort: Service[]): Service[] => {
    const sorted = [...servicesToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status, undefined, { sensitivity: 'base' });
          break;
        case 'enabled':
          // Сначала enabled, потом disabled
          const aEnabledStr = String(a.enabled).toLowerCase();
          const bEnabledStr = String(b.enabled).toLowerCase();
          const aEnabled = aEnabledStr === 'enabled';
          const bEnabled = bEnabledStr === 'enabled';
          if (aEnabled === bEnabled) {
            comparison = aEnabledStr.localeCompare(bEnabledStr);
          } else {
            comparison = aEnabled ? -1 : 1;
          }
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '', undefined, { sensitivity: 'base' });
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const sortedServices = sortServices(services);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Если тот же самый тип сортировки - меняем направление
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Новый тип сортировки - начинаем с возрастающего порядка
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Сортировать по:
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="sort"
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as SortField)}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white text-sm"
            >
              <option value="name">Названию</option>
              <option value="status">Статусу</option>
              <option value="enabled">Enabled/Disabled</option>
              <option value="description">Описанию</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white text-sm flex items-center space-x-1"
              title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            >
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              <span className="hidden sm:inline">{sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}</span>
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          + Создать новый сервис
        </button>
      </div>
      <div className="space-y-4">
        {sortedServices.map((service) => (
          <ServiceItem
            key={service.name}
            name={service.name}
            status={service.status}
            enabled={service.enabled}
            description={service.description}
            details={service.details}
            onAction={(action) => handleServiceAction(service.name, action)}
          />
        ))}
      </div>
      <CreateServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchServices}
      />
    </>
  );
};
