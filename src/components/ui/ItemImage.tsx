'use client';

import React, { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';

interface ItemImageProps {
  itemImageFull?: string;
  itemName?: string;
  alt: string;
  className?: string;
}

const ItemImage: React.FC<ItemImageProps> = ({
  itemImageFull,
  itemName,
  alt,
  className = ''
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
    <img
      src={imageUrl}
      alt={alt}
      className={className}
    />
  );
};

export default ItemImage;