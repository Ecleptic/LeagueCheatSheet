'use client';
import React from 'react';

export default function Inhibitor({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12a9 9 0 1118 0A9 9 0 013 12z" fill="#7DD3FC" />
    </svg>
  );
}