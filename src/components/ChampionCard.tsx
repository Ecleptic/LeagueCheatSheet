'use client';

import React, { useState, useEffect } from 'react';
import { ChampionSummary } from '@/types/champion';
import { riotApi } from '@/lib/riot-api';
import { useChampionInfo } from '@/contexts/ChampionInfoContext';
import { useChampionPositions } from '@/hooks/useChampionPositions';
import PositionIcon from './PositionIcon';
import { Position } from '@/types/team';

interface ChampionCardProps {
  champion: ChampionSummary;
  isFavorite: boolean;
  onToggleFavorite: (championId: string) => void;
  onClick: (champion: ChampionSummary) => void;
}

const getRoleColor = (role: string): string => {
  const roleColors = {
    Fighter: 'bg-red-900 text-red-200',
    Mage: 'bg-blue-900 text-blue-200',
    Assassin: 'bg-purple-900 text-purple-200',
    Support: 'bg-green-900 text-green-200',
    Tank: 'bg-yellow-900 text-yellow-200',
    Marksman: 'bg-orange-900 text-orange-200',
  };
  return roleColors[role as keyof typeof roleColors] || 'bg-gray-900 text-gray-200';
};

const getPositionColor = (position: string): string => {
  const positionColors = {
    Top: 'bg-blue-900 text-blue-200',
    Jungle: 'bg-green-900 text-green-200',
    Mid: 'bg-purple-900 text-purple-200',
    Bot: 'bg-red-900 text-red-200',
    Support: 'bg-yellow-900 text-yellow-200',
  };
  return positionColors[position as keyof typeof positionColors] || 'bg-gray-900 text-gray-200';
};

const ChampionCard: React.FC<ChampionCardProps> = ({
  champion,
  onClick,
  isFavorite,
  onToggleFavorite
}) => {
  const { getChampionInfo } = useChampionInfo();
  const { getChampionPosition } = useChampionPositions();
  const championInfo = getChampionInfo(champion.id);
  const championPosition = getChampionPosition(champion.id);
  const [championImageUrl, setChampionImageUrl] = useState<string>('');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(champion.id);
  };

  useEffect(() => {
    riotApi.getChampionImageUrl(champion.image.full).then(url => {
      setChampionImageUrl(url);
    });
  }, [champion.image.full]);

  return (
    <div
      className="champion-card"
      onClick={() => onClick(champion)}
    >
      {championImageUrl ? (
        <img
          src={championImageUrl}
          alt={champion.name}
          className="w-12 h-12 rounded"
          loading="lazy"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center">
          <span className="text-xs text-gray-400">...</span>
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-medium">{champion.name}</h3>
        {isFavorite && championInfo.playerName && (
          <p className="text-xs text-orange-400 font-medium">{championInfo.playerName}</p>
        )}
        <p className="text-sm text-gray-400">{champion.title}</p>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="flex gap-1 mb-1">
          {/* Show positions with icons if available */}
          {championPosition ? (
            <div className="flex items-center gap-1">
              <PositionIcon 
                position={championPosition.primary.toLowerCase() as Position} 
                size={16}
                className="opacity-90"
              />
              <span className={`text-xs px-2 py-0.5 rounded ${getPositionColor(championPosition.primary)}`}>
                {championPosition.primary}
              </span>
              {championPosition.secondary && championPosition.secondary.length > 0 && (
                <>
                  <PositionIcon 
                    position={championPosition.secondary[0].toLowerCase() as Position} 
                    size={14}
                    className="opacity-70"
                  />
                  <span className={`text-xs px-1 py-0.5 rounded text-gray-400`}>
                    {championPosition.secondary[0]}
                  </span>
                </>
              )}
            </div>
          ) : (
            /* Fallback to role tags if position data not available */
            champion.tags.slice(0, 2).map((role, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-0.5 rounded ${getRoleColor(role)}`}
              >
                {role}
              </span>
            ))
          )}
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`mt-1 text-lg ${isFavorite ? 'text-orange-400' : 'text-gray-500 hover:text-orange-400'} transition-colors`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
};

export default ChampionCard;