'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { riotApi } from '@/lib/riot-api';

interface ItemImageProps {
  itemImageFull?: string;
  itemName?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const ItemImage: React.FC<ItemImageProps> = ({
  itemImageFull,
  itemName,
  alt,
  className = '',
  width = 64,
  height = 64
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const imageIdentifier = itemImageFull || itemName;
    if (imageIdentifier) {
      riotApi.getItemImageUrl(imageIdentifier).then(url => {
        setImageUrl(url);
      });
    }
  }, [itemImageFull, itemName]);

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

export default ItemImage;