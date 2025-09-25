'use client';

import React from 'react';

// TODO: Move all interfaces to their own directory /types
interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-riot-blue mb-4"></div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-6 text-center">
      <div className="text-red-400 text-4xl mb-3">⚠️</div>
      <h3 className="text-red-300 font-medium mb-2">Error Loading Data</h3>
      <p className="text-red-400/80 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-riot-gray/30 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export { LoadingSpinner, ErrorMessage, EmptyState };