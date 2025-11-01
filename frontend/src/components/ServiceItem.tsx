'use client';

import { useState } from 'react';

interface ServiceItemProps {
  name: string;
  status: string;
  enabled: string;
  description: string;
  details: string;
  onAction: (action: string) => Promise<void>;
}

export const ServiceItem = ({ name, status, enabled, description, details, onAction }: ServiceItemProps) => {
  const isRunning = status === 'active';
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{name}</h3>
          <div className="flex space-x-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isRunning ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              enabled === 'enabled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {enabled}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          {isRunning ? (
            <>
              <button
                onClick={() => onAction('restart')}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                Restart
              </button>
              <button
                onClick={() => onAction('stop')}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Stop
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction('start')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Start
            </button>
          )}
          <button
            onClick={() => onAction('delete')}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      {showDetails && details && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-700 rounded border border-gray-200 dark:border-zinc-600">
          <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(JSON.parse(details), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};