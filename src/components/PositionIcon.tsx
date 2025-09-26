'use client';

import Image from 'next/image';
import { Position } from '@/types/team';

interface PositionIconProps {
  position: Position;
  size?: number;
  className?: string;
}

const positionConfig: Record<Position, { name: string; icon: string }> = {
  top: { name: 'Top', icon: '/icons/positions/Top_icon.png' },
  jungle: { name: 'Jungle', icon: '/icons/positions/Jungle_icon.png' },
  mid: { name: 'Mid', icon: '/icons/positions/Middle_icon.png' },
  bot: { name: 'Bot', icon: '/icons/positions/Bottom_icon.png' },
  support: { name: 'Support', icon: '/icons/positions/Support_icon.png' },
};

export default function PositionIcon({ position, size = 24, className = '' }: PositionIconProps) {
  const config = positionConfig[position];
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Image
        src={config.icon}
        alt={`${config.name} position`}
        width={size}
        height={size}
        className="object-contain"
        title={config.name}
      />
    </div>
  );
}

// Export position utilities
export const getPositionName = (position: Position): string => {
  return positionConfig[position].name;
};

export const getPositionIcon = (position: Position): string => {
  return positionConfig[position].icon;
};

export const getAllPositions = (): Position[] => {
  return Object.keys(positionConfig) as Position[];
};