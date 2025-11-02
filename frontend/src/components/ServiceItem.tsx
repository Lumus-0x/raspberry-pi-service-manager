'use client';

import { useState } from 'react';

interface ServiceItemProps {
  name: string;
  status: string;
  enabled: boolean | string;
  description: string;
  details: string;
  onAction: (action: string) => Promise<void>;
}

export const ServiceItem = ({ 
  name, 
  status, 
  enabled, 
  description, 
  details, 
  onAction 
}: ServiceItemProps) => {
  const isRunning = status === 'active';
  const isEnabled = enabled === 'enabled' || enabled === true || String(enabled).toLowerCase() === 'enabled';
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  
  // Функция для безопасного парсинга JSON
  const parseDetails = () => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch (e) {
      console.error('Invalid JSON in details:', e);
      return { error: 'Invalid JSON', raw: details };
    }
  };

  const parsedDetails = parseDetails();

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onAction(action);
    } finally {
      setLoading(null);
    }
  };

  const Button = ({ 
    onClick, 
    children, 
    variant = 'primary',
    action = '',
    disabled = false,
    className = ''
  }: { 
    onClick: () => void; 
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
    action?: string;
    disabled?: boolean;
    className?: string;
  }) => {
    const baseClasses = "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-md hover:shadow-lg";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
      success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
      info: "bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800"
    };

    const isLoading = action && loading === action;

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading !== null}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  };

  return (
    <div className="p-5 bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-zinc-700 transform hover:-translate-y-1">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">{name}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              isRunning 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-sm' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 shadow-sm'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
              isEnabled
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-sm' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 shadow-sm'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${isEnabled ? 'bg-blue-500' : 'bg-gray-500'}`}></span>
              {isEnabled ? 'enabled' : 'disabled'}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="secondary"
            action=""
            className="min-w-[120px]"
          >
            {showDetails ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span>Скрыть</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Детали</span>
              </>
            )}
          </Button>
          
          {/* Enable/Disable кнопки */}
          {isEnabled ? (
            <Button
              onClick={() => handleAction('disable')}
              variant="warning"
              action="disable"
              disabled={loading !== null}
              className="min-w-[110px]"
            >
              {loading !== 'disable' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
              <span>Disable</span>
            </Button>
          ) : (
            <Button
              onClick={() => handleAction('enable')}
              variant="info"
              action="enable"
              disabled={loading !== null}
              className="min-w-[110px]"
            >
              {loading !== 'enable' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>Enable</span>
            </Button>
          )}

          {/* Start/Stop/Restart кнопки */}
          {isRunning ? (
            <>
              <Button
                onClick={() => handleAction('restart')}
                variant="warning"
                action="restart"
                disabled={loading !== null}
                className="min-w-[100px]"
              >
                {loading !== 'restart' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>Restart</span>
              </Button>
              <Button
                onClick={() => handleAction('stop')}
                variant="danger"
                action="stop"
                disabled={loading !== null}
                className="min-w-[90px]"
              >
                {loading !== 'stop' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                )}
                <span>Stop</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleAction('start')}
              variant="success"
              action="start"
              disabled={loading !== null}
              className="min-w-[100px]"
            >
              {loading !== 'start' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>Start</span>
            </Button>
          )}
          
          <Button
            onClick={() => handleAction('delete')}
            variant="danger"
            action="delete"
            disabled={loading !== null}
            className="min-w-[100px]"
          >
            {loading !== 'delete' && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            <span>Delete</span>
          </Button>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600 animate-fadeIn">
          {parsedDetails ? (
            <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">
              {JSON.stringify(parsedDetails, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Нет дополнительной информации о службе</p>
          )}
        </div>
      )}
    </div>
  );
};
