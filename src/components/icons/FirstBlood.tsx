'use client';
import React from 'react';

export default function FirstBlood({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a6 6 0 00-6 6c0 6 6 10 6 10s6-4 6-10a6 6 0 00-6-6z" fill="#EF4444" />
    </svg>
  );
}