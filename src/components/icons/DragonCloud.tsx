'use client';
import React from 'react';

export default function DragonCloud({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14a4 4 0 010-8 5 5 0 019.9 1.2A3 3 0 0119 12H6z" fill="#93C5FD" />
    </svg>
  );
}