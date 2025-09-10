import React, { useState } from 'react';
import { IconCloud, IconCloudCheck, IconCloudOff, IconEdit, IconEye } from './Icon';
import type { SaveStatus } from '../types';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  isReadOnly: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const statusConfig = {
  unsaved: {
    icon: <IconEdit className="w-5 h-5" />,
    text: 'Unsaved changes',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  saving: {
    icon: <IconCloud className="w-5 h-5 animate-pulse" />,
    text: 'Saving...',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  saved: {
    icon: <IconCloudCheck className="w-5 h-5" />,
    text: 'All changes saved',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  error: {
    icon: <IconCloudOff className="w-5 h-5" />,
    text: 'Error saving data',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  readonly: {
    icon: <IconEye className="w-5 h-5" />,
    text: 'Read-Only Mode',
    color: 'text-gray-400',
    bgColor: 'bg-gray-700/50',
  },
  idle: {
      icon: null,
      text: null,
      color: '',
      bgColor: ''
  }
};

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, isReadOnly, errorMessage, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const effectiveStatus = isReadOnly ? 'readonly' : status;

  if (effectiveStatus === 'idle') {
    return null;
  }

  const { icon, text, color, bgColor } = statusConfig[effectiveStatus];
  const displayMessage = effectiveStatus === 'saving' && errorMessage ? errorMessage : text;
  
  const isClickableError = effectiveStatus === 'error' && errorMessage;

  const handleContainerClick = () => {
    if (isClickableError) {
      setIsExpanded(prev => !prev);
    }
  };

  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry?.();
    setIsExpanded(false);
  };

  // For all states except error, render a compact pill-shaped indicator.
  if (effectiveStatus !== 'error') {
    return (
      <div
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border border-gray-600 backdrop-blur-md transition-all duration-300 ${bgColor} ${color}`}
        role="status"
        aria-live="polite"
      >
        {icon}
        <span className="text-sm font-semibold">{displayMessage}</span>
      </div>
    );
  }

  // For the error state, render a more prominent, expandable rectangle.
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex flex-col items-start p-3 rounded-lg shadow-lg border border-gray-600 backdrop-blur-md transition-all duration-300 ${bgColor} ${color} ${isClickableError ? 'cursor-pointer' : ''} ${isExpanded ? 'max-w-sm w-full' : ''}`}
      role="alert"
      aria-live="assertive"
      onClick={handleContainerClick}
    >
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-semibold">{text}</span>
        </div>
        {onRetry && (
            <button
                onClick={handleRetryClick}
                className="flex-shrink-0 text-xs font-bold bg-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
                Retry
            </button>
        )}
      </div>
      {isExpanded && errorMessage && (
        <div className="w-full mt-2 pt-2 border-t border-gray-600/50">
          <p className="text-xs text-gray-300 whitespace-pre-wrap">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default SaveStatusIndicator;
