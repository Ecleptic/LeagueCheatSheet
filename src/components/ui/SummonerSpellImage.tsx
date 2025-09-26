'use client';

import React, { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';

interface SummonerSpellImageProps {
  spellImageFull: string;
  alt: string;
  className?: string;
}

const SummonerSpellImage: React.FC<SummonerSpellImageProps> = ({
  spellImageFull,
  alt,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    riotApi.getSummonerSpellImageUrl(spellImageFull).then(url => {
      setImageUrl(url);
    });
  }, [spellImageFull]);

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

export default SummonerSpellImage;