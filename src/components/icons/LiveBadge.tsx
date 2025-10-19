'use client';
import React from 'react';

export default function LiveBadge({ className = 'px-2 py-0.5 text-xs rounded', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <span className={className + ' bg-red-600 text-white font-semibold'}>{children || 'LIVE'}</span>
  );
}