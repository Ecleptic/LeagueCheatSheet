'use client';

import React, { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-remove after duration
    const duration = toast.duration || 4000;
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const typeStyles = {
    success: {
      bg: 'bg-green-900/90 border-green-500/30',
      icon: '✅',
      iconColor: 'text-green-400',
    },
    error: {
      bg: 'bg-red-900/90 border-red-500/30',
      icon: '❌',
      iconColor: 'text-red-400',
    },
    info: {
      bg: 'bg-blue-900/90 border-blue-500/30',
      icon: 'ℹ️',
      iconColor: 'text-blue-400',
    },
    warning: {
      bg: 'bg-yellow-900/90 border-yellow-500/30',
      icon: '⚠️',
      iconColor: 'text-yellow-400',
    },
  };

  const style = typeStyles[toast.type];

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${style.bg} border rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm`}>
        <div className="flex items-start space-x-3">
          <span className={`text-lg ${style.iconColor}`}>{style.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm">{toast.title}</h4>
            <p className="text-gray-300 text-sm mt-1">{toast.message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onRemove(toast.id), 300);
            }}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;