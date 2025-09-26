'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { riotApi } from '@/lib/riot-api';

interface AbilityImageProps {
  abilityImageFull: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const AbilityImage: React.FC<AbilityImageProps> = ({
  abilityImageFull,
  alt,
  className = '',
  width = 64,
  height = 64
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

export default AbilityImage;