'use client';

import React, { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';

interface ChampionImageProps {
  championImageFull: string;
  alt: string;
  className?: string;
}

const ChampionImage: React.FC<ChampionImageProps> = ({
  championImageFull,
  alt,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    riotApi.getChampionImageUrl(championImageFull).then(url => {
      setImageUrl(url);
    });
  }, [championImageFull]);

  if (!imageUrl) {
    return (
      <div className={`bg-gray-600 animate-pulse ${className}`} />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
    />
  );
};

export default ChampionImage;