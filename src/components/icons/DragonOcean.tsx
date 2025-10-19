'use client';
import React from 'react';

export default function DragonOcean({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7 2 4 6 4 9c0 4 4 7 8 11 4-4 8-7 8-11 0-3-3-7-8-7z" fill="#60A5FA" />
    </svg>
  );
}