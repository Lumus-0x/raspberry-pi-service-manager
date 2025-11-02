/**
 * Получить базовый URL API
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  // Client-side - используем прокси через /api для rewrites
  return '/api';
}

/**
 * Выполнить API запрос
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Добавляем токен авторизации если он есть
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return response;
}

