'use client';
import React from 'react';

export default function Tower({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="12" height="16" rx="2" fill="#FCD34D" />
    </svg>
  );
}