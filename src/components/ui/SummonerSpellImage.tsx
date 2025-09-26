'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { riotApi } from '@/lib/riot-api';

interface SummonerSpellImageProps {
  spellImageFull: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const SummonerSpellImage: React.FC<SummonerSpellImageProps> = ({
  spellImageFull,
  alt,
  className = '',
  width = 64,
  height = 64
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spellImageFull) {
      setLoading(false);
      setImageUrl('');
      return;
    }

    riotApi.getSummonerSpellImageUrl(spellImageFull).then(url => {
      setImageUrl(url);
      setLoading(false);
    }).catch(() => {
      setImageUrl('');
      setLoading(false);
    });
  }, [spellImageFull]);

  if (loading || !imageUrl) {
    return (
      <div 
        className={`bg-gray-600 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs text-gray-400">?</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={false}
      unoptimized={true}
    />
  );
};

export default SummonerSpellImage;