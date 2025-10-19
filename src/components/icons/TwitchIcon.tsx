'use client';
import React from 'react';

export default function TwitchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#9146FF" d="M3 3v14h4v4l4-4h4l4-4V3H3zm16 8l-2 2h-4l-4 4v-4H5V5h14v6z" />
    </svg>
  );
}