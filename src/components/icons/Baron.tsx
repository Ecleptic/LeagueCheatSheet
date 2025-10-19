'use client';
import React from 'react';

export default function Baron({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8 2 4 6 4 10s4 8 8 12c4-4 8-8 8-12s-4-8-8-8z" fill="#C084FC" />
    </svg>
  );
}