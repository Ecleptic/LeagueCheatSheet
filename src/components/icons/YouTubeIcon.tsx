'use client';
import React from 'react';

export default function YouTubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FF0000" d="M21.6 7.2s-.2-1.6-.8-2.2c-.8-.8-1.7-.8-2.1-.9C15.4 4 12 4 12 4h-.1s-3.4 0-6.7.1c-.4 0-1.3.1-2.1.9C2.6 5.6 2.4 7.2 2.4 7.2S2 9 2 10.8v2.4C2 15 2.4 16.8 2.4 16.8s.2 1.6.8 2.2c.8.8 1.9.8 2.4.9 1.7.2 6.9.2 6.9.2s3.4 0 6.7-.1c.4 0 1.3-.1 2.1-.9.6-.6.8-2.2.8-2.2s.4-1.8.4-3.6v-2.4c0-1.8-.4-3.6-.4-3.6zM9.6 14.4V9.6L14.4 12l-4.8 2.4z" />
    </svg>
  );
}