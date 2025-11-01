'use client';

import { useEffect, useState } from 'react';
import { ServiceItem } from './ServiceItem';

interface Service {
  name: string;
  status: string;
}

export const ServiceList = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch services');
      
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

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, action })
      });
      
      if (!response.ok) throw new Error(`Failed to ${action} service`);
      
      // Обновляем список после успешного действия
      await fetchServices();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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
    <div className="space-y-4">
      {services.map((service) => (
        <ServiceItem
          key={service.name}
          name={service.name}
          status={service.status}
          onAction={(action) => handleServiceAction(service.name, action)}
        />
      ))}
    </div>
  );
};