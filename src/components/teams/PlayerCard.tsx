'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../../types/team';
import { usePlayerActions, useTeamValidation } from '../../hooks/useTeamActions';
import { riotApi } from '../../lib/riot-api';
import ChampionSelector from './ChampionSelector';
import SummonerSpellSelector from './SummonerSpellSelector';
import ItemSelector from './ItemSelector';

interface PlayerCardProps {
  player: Player;
  team: 'blue' | 'red';
  forceExpanded?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, team, forceExpanded }) => {
  const playerActions = usePlayerActions(team, player.id);
  const { hasCompleteSummonerSpells, getAvailableItemSlots } = useTeamValidation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [championImageUrl, setChampionImageUrl] = useState<string>('');
  const [expandedChampionImageUrl, setExpandedChampionImageUrl] = useState<string>('');
  const [summonerSpellImageUrls, setSummonerSpellImageUrls] = useState<[string, string]>(['', '']);
  const [itemImageUrls, setItemImageUrls] = useState<string[]>(new Array(7).fill(''));

  // Load champion image URL when champion changes
  useEffect(() => {
    if (player.champion?.image?.full) {
      riotApi.getChampionImageUrl(player.champion.image.full).then(url => {
        setChampionImageUrl(url);
        setExpandedChampionImageUrl(url);
      });
    } else {
      setChampionImageUrl('');
      setExpandedChampionImageUrl('');
    }
  }, [player.champion?.image?.full]);

  // Load summoner spell image URLs when spells change
  useEffect(() => {
    const loadSpellImages = async () => {
      const urls: [string, string] = ['', ''];
      for (let i = 0; i < 2; i++) {
        if (player.summonerSpells[i]?.image?.full) {
          urls[i] = await riotApi.getSummonerSpellImageUrl(player.summonerSpells[i]!.image.full);
        }
      }
      setSummonerSpellImageUrls(urls);
    };
    loadSpellImages();
  }, [player.summonerSpells[0]?.image?.full, player.summonerSpells[1]?.image?.full]);

  // Load item image URLs when items change
  useEffect(() => {
    const loadItemImages = async () => {
      const urls = new Array(7).fill('');
      for (let i = 0; i < 7; i++) {
        if (player.items[i]?.item?.image?.full) {
          urls[i] = await riotApi.getItemImageUrl(player.items[i]!.item!.image.full);
        }
      }
      setItemImageUrls(urls);
    };
    loadItemImages();
  }, [player.items.map(item => item.item?.image?.full).join(',')]);
  const [tempName, setTempName] = useState(player.name);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChampionSelector, setShowChampionSelector] = useState(false);
  const [showSummonerSpellSelector, setShowSummonerSpellSelector] = useState(false);
  const [selectedSpellSlot, setSelectedSpellSlot] = useState<0 | 1>(0);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItemSlot, setSelectedItemSlot] = useState(0);
  const [isBootsSlot, setIsBootsSlot] = useState(false);
  
  // Use forceExpanded if provided, otherwise use local state
  const shouldExpand = forceExpanded !== undefined ? forceExpanded : isExpanded;

  const handleNameSave = () => {
    if (tempName.trim()) {
      playerActions.setName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const availableSlots = getAvailableItemSlots(team, player.id);
  const hasAllSpells = hasCompleteSummonerSpells(team, player.id);

  // Team-specific styling
  const teamBorderColor = team === 'blue' ? 'border-lol-blue-main/50' : 'border-lol-red-main/50';
  const teamBgColor = team === 'blue' 
    ? 'bg-lol-blue-dark/10 hover:bg-lol-blue-dark/20' 
    : 'bg-lol-red-dark/10 hover:bg-lol-red-dark/20';
  const teamAccentColor = team === 'blue' ? 'text-lol-blue-accent' : 'text-lol-red-accent';

  return (
    <div className={`bg-riot-gray/50 rounded-lg border ${teamBorderColor} overflow-hidden`}>
      {/* Collapsed View / Header - Always Visible */}
      <div 
        className={`flex items-center justify-between p-3 cursor-pointer ${teamBgColor} transition-colors`}
        onClick={() => {
          if (forceExpanded === undefined) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {/* Left side - Player info summary */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Champion Avatar */}
          <div className="flex-shrink-0">
            {player.champion && championImageUrl ? (
              <img
                src={championImageUrl}
                alt={player.champion.name}
                className="w-10 h-10 rounded border border-gray-500"
              />
            ) : (
              <div className="w-10 h-10 border-2 border-dashed border-gray-500 rounded flex items-center justify-center text-gray-400 text-xs">
                ?
              </div>
            )}
          </div>

          {/* Player Name and Champion */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm truncate">{player.name}</div>
            <div className="text-xs text-gray-400 truncate">
              {player.champion ? player.champion.name : 'No Champion'}
            </div>
          </div>

          {/* Summoner Spells Mini */}
          <div className="flex gap-1 flex-shrink-0">
            {[0, 1].map((slot) => (
              <div key={slot}>
                {player.summonerSpells[slot as 0 | 1] && summonerSpellImageUrls[slot] ? (
                  <img
                    src={summonerSpellImageUrls[slot]}
                    alt={player.summonerSpells[slot as 0 | 1]!.name}
                    className="w-6 h-6 rounded border border-gray-500"
                  />
                ) : (
                  <div className="w-6 h-6 border border-dashed border-gray-500 rounded bg-gray-700"></div>
                )}
              </div>
            ))}
          </div>

          {/* Status Indicators Mini */}
          <div className="flex gap-1 flex-shrink-0">
            {!player.champion && (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="No Champion"></div>
            )}
            {!hasAllSpells && (
              <div className="w-2 h-2 bg-amber-500 rounded-full" title="Missing Spells"></div>
            )}
            {availableSlots.length === 7 && (
              <div className="w-2 h-2 bg-slate-400 rounded-full" title="No Items"></div>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <div className="flex-shrink-0 ml-2">
          <div className={`transform transition-transform ${shouldExpand ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded View - Collapsible Content */}
      {shouldExpand && (
        <div className="border-t border-gray-600 p-4 space-y-4">
          {/* Player Header - Edit Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-riot-dark border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    placeholder="Player name"
                    maxLength={15}
                    autoFocus
                  />
                  <button
                    onClick={handleNameSave}
                    className="px-1 py-1 bg-green-600 rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setTempName(player.name);
                      setIsEditingName(false);
                    }}
                    className="px-1 py-1 bg-gray-600 rounded text-xs hover:bg-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{player.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }}
                    className="text-gray-400 hover:text-white text-xs"
                    title="Edit name"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Champion Selection */}
          <div>
            {player.champion && expandedChampionImageUrl ? (
              <div className="flex items-center gap-2 p-2 bg-riot-dark rounded border border-gray-500">
                <img
                  src={expandedChampionImageUrl}
                  alt={player.champion.name}
                  className="w-8 h-8 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{player.champion.name}</div>
                  <div className="text-xs text-gray-400 truncate">{player.champion.title}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playerActions.removeChampion();
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                  title="Remove champion"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                className="w-full p-3 border-2 border-dashed border-gray-500 rounded text-gray-400 hover:border-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChampionSelector(true);
                }}
              >
                + Select Champion
              </button>
            )}
          </div>

          {/* Summoner Spells */}
          <div className="flex gap-2">
            {[0, 1].map((slot) => (
              <div key={slot} className="flex-1">
                {player.summonerSpells[slot as 0 | 1] && summonerSpellImageUrls[slot] ? (
                  <div className="relative">
                    <img
                      src={summonerSpellImageUrls[slot]}
                      alt={player.summonerSpells[slot as 0 | 1]!.name}
                      className="w-full aspect-square rounded border border-gray-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playerActions.removeSummonerSpell(slot as 0 | 1);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full aspect-square border-2 border-dashed border-gray-500 rounded text-gray-400 hover:border-gray-400 hover:text-white transition-colors text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpellSlot(slot as 0 | 1);
                      setShowSummonerSpellSelector(true);
                    }}
                  >
                    + Spell
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-3 gap-1">
            {player.items.slice(0, 6).map((itemSlot) => (
              <div key={itemSlot.id} className="aspect-square">
                {itemSlot.item && itemImageUrls[itemSlot.id] ? (
                  <div className="relative group">
                    <img
                      src={itemImageUrls[itemSlot.id]}
                      alt={itemSlot.item.name}
                      className="w-full h-full rounded border border-gray-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playerActions.removeItem(itemSlot.id);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs hover:bg-red-700 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full h-full border-2 border-dashed border-gray-600 rounded text-gray-500 hover:border-gray-400 hover:text-white transition-colors text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemSlot(itemSlot.id);
                      setIsBootsSlot(false);
                      setShowItemSelector(true);
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Boots Slot */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Boots</div>
            {player.items[6]?.item && itemImageUrls[6] ? (
              <div className="relative inline-block">
                <img
                  src={itemImageUrls[6]}
                  alt={player.items[6].item.name}
                  className="w-12 h-12 rounded border border-gray-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playerActions.removeItem(6);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                className="w-12 h-12 border-2 border-dashed border-gray-600 rounded text-gray-500 hover:border-gray-400 hover:text-white transition-colors text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemSlot(6);
                  setIsBootsSlot(true);
                  setShowItemSelector(true);
                }}
              >
                👟
              </button>
            )}
          </div>

          {/* Status Indicators */}
          <div className="flex gap-1">
            {!player.champion && (
              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">No Champion</span>
            )}
            {!hasAllSpells && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs">Missing Spells</span>
            )}
            {availableSlots.length === 7 && (
              <span className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded text-xs">No Items</span>
            )}
          </div>
        </div>
      )}
      
      {/* Champion Selector Modal */}
      <ChampionSelector
        isOpen={showChampionSelector}
        onClose={() => setShowChampionSelector(false)}
        team={team}
        playerId={player.id}
        playerName={player.name}
      />
      
      {/* Summoner Spell Selector Modal */}
      <SummonerSpellSelector
        isOpen={showSummonerSpellSelector}
        onClose={() => setShowSummonerSpellSelector(false)}
        team={team}
        playerId={player.id}
        playerName={player.name}
        spellSlot={selectedSpellSlot}
      />
      
      {/* Item Selector Modal */}
      <ItemSelector
        isOpen={showItemSelector}
        onClose={() => setShowItemSelector(false)}
        team={team}
        playerId={player.id}
        playerName={player.name}
        itemSlotId={selectedItemSlot}
        isBootsSlot={isBootsSlot}
      />
    </div>
  );
};

export default PlayerCard;