'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SummonerSpellSummary } from '@/types/summonerSpell';
import { riotApi } from '@/lib/riot-api';

interface SummonerSpellCardProps {
  summonerSpell: SummonerSpellSummary;
  onClick: (summonerSpell: SummonerSpellSummary) => void;
}

const SummonerSpellCard: React.FC<SummonerSpellCardProps> = ({
  summonerSpell,
  onClick,
}) => {
  const [spellImageUrl, setSpellImageUrl] = useState<string>('');

  useEffect(() => {
    riotApi.getSummonerSpellImageUrl(summonerSpell.image.full).then(url => {
      setSpellImageUrl(url);
    });
  }, [summonerSpell.image.full]);

  // Clean HTML from description
  const cleanDescription = summonerSpell.description.replace(/<[^>]*>/g, '');

  return (
    <div
      className="summoner-spell-card bg-riot-gray rounded-lg p-3 cursor-pointer hover:bg-riot-gray/80 transition-colors border border-gray-600/50 hover:border-riot-blue/50"
      onClick={() => onClick(summonerSpell)}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          {spellImageUrl ? (
            <Image
              src={spellImageUrl}
              alt={summonerSpell.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded border border-gray-600"
              priority={false}
              unoptimized={true}
            />
          ) : (
            <div className="w-12 h-12 rounded border border-gray-600 bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-400">...</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-riot-dark border border-gray-600 rounded px-1 text-xs text-riot-gold">
            {summonerSpell.summonerLevel}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white">{summonerSpell.name}</h3>
          <p className="text-xs text-gray-300 line-clamp-2">{cleanDescription}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-blue-400">CD: {summonerSpell.cooldownBurn}s</span>
            {summonerSpell.modes.length > 0 && (
              <span className="text-xs text-gray-400">
                {summonerSpell.modes.includes('CLASSIC') ? '5v5' : summonerSpell.modes[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummonerSpellCard;