'use client';

import React, { useState, useEffect } from 'react';
import { SummonerSpellSummary, SummonerSpell } from '@/types/summonerSpell';
import { riotApi } from '@/lib/riot-api';

interface SummonerSpellModalProps {
  summonerSpell: SummonerSpellSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

const SummonerSpellModal: React.FC<SummonerSpellModalProps> = ({
  summonerSpell,
  isOpen,
  onClose,
}) => {
  const [summonerSpellDetail, setSummonerSpellDetail] = useState<SummonerSpell | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && summonerSpell) {
      fetchSummonerSpellDetail();
    }
  }, [isOpen, summonerSpell]);

  const fetchSummonerSpellDetail = async () => {
    if (!summonerSpell) return;
    
    try {
      setLoading(true);
      const response = await riotApi.getSummonerSpells();
      setSummonerSpellDetail(response.data[summonerSpell.id]);
    } catch (error) {
      console.error('Error fetching summoner spell detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !summonerSpell) return null;

  const [spellImageUrl, setSpellImageUrl] = useState<string>('');
  
  useEffect(() => {
    if (summonerSpell && isOpen) {
      riotApi.getSummonerSpellImageUrl(summonerSpell.image.full).then(url => {
        setSpellImageUrl(url);
      });
    }
  }, [summonerSpell, isOpen]);
  
  // Clean HTML from descriptions
  const cleanDescription = (text: string) => text.replace(/<[^>]*>/g, '');

  return (
    <div 
      className="fixed inset-0 bg-riot-dark z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="h-full">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-800 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Spell Info - Compact Layout */}
          <div className="pt-16 pb-6 px-4">
            <div className="flex items-center space-x-4 mb-3">
              <div className="relative">
                <img
                  src={spellImageUrl}
                  alt={summonerSpell.name}
                  className="w-14 h-14 rounded-lg border-2 border-white/20 bg-black/20 backdrop-blur-sm"
                  loading="lazy"
                />
                <div className="absolute -bottom-1 -right-1 bg-riot-gold text-riot-dark rounded-full px-1.5 py-0.5 text-xs font-bold">
                  {summonerSpell.summonerLevel}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{summonerSpell.name}</h2>
                <p className="text-blue-200 text-sm">Summoner Spell</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-600/80 text-white text-sm rounded-full">
                CD: {summonerSpell.cooldownBurn}s
              </span>
              <span className="px-3 py-1 bg-purple-600/80 text-white text-sm rounded-full">
                Level {summonerSpell.summonerLevel}+
              </span>
              {summonerSpell.modes.length > 0 && (
                <span className="px-3 py-1 bg-gray-600/80 text-white text-sm rounded-full">
                  {summonerSpell.modes.includes('CLASSIC') ? 'Summoner\'s Rift' : summonerSpell.modes.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-riot-blue"></div>
            </div>
          ) : (
            <>
              {/* Description */}
              <div className="bg-riot-gray rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3 text-riot-blue">Description</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {cleanDescription(summonerSpell.description)}
                </p>
              </div>

              {/* Detailed Tooltip */}
              {summonerSpellDetail && (
                <div className="bg-riot-gray rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3 text-riot-blue">Details</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {cleanDescription(summonerSpellDetail.tooltip)}
                  </p>
                </div>
              )}

              {/* Stats */}
              {summonerSpellDetail && (
                <div className="bg-riot-gray rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-riot-blue">Stats</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Cooldown</div>
                      <div className="text-lg font-bold text-yellow-400">{summonerSpellDetail.cooldownBurn}s</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Required Level</div>
                      <div className="text-lg font-bold text-blue-400">{summonerSpellDetail.summonerLevel}</div>
                    </div>
                    {summonerSpellDetail.range && summonerSpellDetail.range[0] > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Range</div>
                        <div className="text-lg font-bold text-green-400">{summonerSpellDetail.rangeBurn}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Game Modes</div>
                      <div className="text-sm text-gray-300">
                        {summonerSpellDetail.modes.includes('CLASSIC') ? 'All Game Modes' : summonerSpellDetail.modes.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummonerSpellModal;