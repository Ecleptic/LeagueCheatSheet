'use client';

import React from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt: string;
  title?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  imageAlt,
  title,
  onClose,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-sm rounded-t-lg">
          {title && (
            <h3 className="text-white font-semibold text-lg">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors ml-auto"
            aria-label="Close image"
          >
            ✕
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-b-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={800}
            height={600}
            className="max-w-full max-h-full object-contain"
            unoptimized={true}
          />
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white/80 text-sm bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {imageAlt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;