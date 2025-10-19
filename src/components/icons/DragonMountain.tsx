'use client';
import React from 'react';

export default function DragonMountain({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 20h20L12 6 2 20z" fill="#A78BFA" />
    </svg>
  );
}