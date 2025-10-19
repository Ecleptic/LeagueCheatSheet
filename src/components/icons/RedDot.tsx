'use client';
import React from 'react';

export default function RedDot({ className = 'w-4 h-4' }: { className?: string }) {
  return <span className={className + ' inline-block rounded-full bg-red-500'} aria-hidden />;
}