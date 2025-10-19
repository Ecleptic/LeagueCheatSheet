'use client';
import React from 'react';

export default function Kill({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12l6-9 6 9 6-9v14H3V12z" fill="#60A5FA" />
    </svg>
  );
}