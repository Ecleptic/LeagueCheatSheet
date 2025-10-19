'use client';
import React from 'react';

export default function StatsIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="3" height="11" fill="#60A5FA" />
      <rect x="10.5" y="6" width="3" height="15" fill="#34D399" />
      <rect x="18" y="3" width="3" height="18" fill="#F472B6" />
    </svg>
  );
}