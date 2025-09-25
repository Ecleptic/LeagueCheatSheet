'use client';

import React, { useState, useEffect } from 'react';
import { ChampionSummary } from '@/types/champion';
import { riotApi } from '@/lib/riot-api';
import { useChampionInfo } from '@/contexts/ChampionInfoContext';

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

const ChampionCard: React.FC<ChampionCardProps> = ({
  champion,
  onClick,
  isFavorite,
  onToggleFavorite
}) => {
  const { getChampionInfo } = useChampionInfo();
  const championInfo = getChampionInfo(champion.id);
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
        <div className="flex gap-1">
          {champion.tags.slice(0, 2).map((role, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-0.5 rounded ${getRoleColor(role)}`}
            >
              {role}
            </span>
          ))}
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