'use client';

import React, { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';

interface PassiveImageProps {
  passiveImageFull: string;
  alt: string;
  className?: string;
}

const PassiveImage: React.FC<PassiveImageProps> = ({
  passiveImageFull,
  alt,
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    riotApi.getPassiveImageUrl(passiveImageFull).then(url => {
      setImageUrl(url);
    });
  }, [passiveImageFull]);

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

export default PassiveImage;