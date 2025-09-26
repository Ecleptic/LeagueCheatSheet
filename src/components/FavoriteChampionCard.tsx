'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChampionSummary } from '@/types/champion';
import { riotApi } from '@/lib/riot-api';
import { useChampionPositions } from '@/hooks/useChampionPositions';
import PositionIcon from './PositionIcon';
import { Position } from '@/types/team';

interface FavoriteChampionCardProps {
  champion: ChampionSummary;
  onClick: (champion: ChampionSummary) => void;
  playerName?: string;
}

const FavoriteChampionCard: React.FC<FavoriteChampionCardProps> = ({
  champion,
  onClick,
  playerName
}) => {
  const [championImageUrl, setChampionImageUrl] = useState<string>('');
  const { getChampionPosition } = useChampionPositions();
  const championPosition = getChampionPosition(champion.id);

  useEffect(() => {
    riotApi.getChampionImageUrl(champion.image.full).then(url => {
      setChampionImageUrl(url);
    });
  }, [champion.image.full]);

  return (
    <div
      key={champion.id}
      onClick={() => onClick(champion)}
      className="bg-blue-800/60 backdrop-blur-sm rounded-lg p-2 border border-blue-600/30 cursor-pointer hover:bg-blue-700/60 transition-colors"
    >
      {championImageUrl ? (
        <Image
          src={championImageUrl}
          alt={champion.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded mx-auto mb-1"
          priority={false}
          unoptimized={true}
        />
      ) : (
        <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center mx-auto mb-1">
          <span className="text-xs text-gray-400">...</span>
        </div>
      )}
      <p className="text-xs text-center text-blue-100">{champion.name}</p>
      {playerName && (
        <p className="text-xs text-center text-orange-400 font-medium">{playerName}</p>
      )}
      {championPosition && (
        <div className="flex justify-center mt-1">
          <div className="flex items-center gap-1">
            <PositionIcon 
              position={championPosition.primary.toLowerCase() as Position} 
              size={12}
              className="opacity-80"
            />
            <span className="text-xs text-blue-200">{championPosition.primary}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteChampionCard;