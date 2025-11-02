/**
 * Централизованная конфигурация приложения
 * Загружается из config.ini через API endpoint
 */

let cachedConfig: any = null;

export async function getConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Загружаем конфигурацию из backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/config`);
    
    if (response.ok) {
      cachedConfig = await response.json();
      return cachedConfig;
    }
  } catch (error) {
    console.error('Failed to load config from API:', error);
  }

  // Fallback значения
  cachedConfig = {
    api_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    frontend_url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  };

  return cachedConfig;
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

