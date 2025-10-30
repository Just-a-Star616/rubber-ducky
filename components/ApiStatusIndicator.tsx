
import React from 'react';

export type ApiStatus = 'operational' | 'degraded' | 'down';

interface ApiStatusIndicatorProps {
  status: ApiStatus;
}

const statusConfig: { [key in ApiStatus]: { color: string; text: string; } } = {
  operational: {
    color: 'bg-green-500',
    text: 'API Operational',
  },
  degraded: {
    color: 'bg-yellow-500',
    text: 'API Degraded',
  },
  down: {
    color: 'bg-red-500',
    text: 'API Down',
  },
};

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ status }) => {
  const { color, text } = statusConfig[status];
  const isAnimated = status !== 'operational';

  return (
    <div className="flex items-center space-x-2" title={text}>
      <span className="relative flex h-3 w-3">
        {isAnimated && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{text}</span>
    </div>
  );
};

export default ApiStatusIndicator;