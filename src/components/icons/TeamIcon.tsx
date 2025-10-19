'use client';
import React from 'react';

export default function TeamIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#94A3B8" d="M12 2l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z" />
    </svg>
  );
}