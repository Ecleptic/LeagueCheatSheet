'use client';

import React, { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';

interface AbilityImageProps {
  abilityImageFull: string;
  alt: string;
  className?: string;
}

const AbilityImage: React.FC<AbilityImageProps> = ({
  abilityImageFull,
  alt,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    riotApi.getAbilityImageUrl(abilityImageFull).then(url => {
      setImageUrl(url);
    });
  }, [abilityImageFull]);

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

export default AbilityImage;