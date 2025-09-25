'use client';

import React, { useState, useMemo } from 'react';
import { ChampionSummary } from '@/types/champion';
import { useChampions } from '@/hooks/useChampions';
import { usePlayerActions, useTeamData } from '@/hooks/useTeamActions';
import ChampionCard from '@/components/ChampionCard';
import { useFavorites } from '@/hooks/useFavorites';

interface ChampionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  team: 'blue' | 'red';
  playerId: string;
  playerName: string;
}

const ChampionSelector: React.FC<ChampionSelectorProps> = ({
  isOpen,
  onClose,
  team,
  playerId,
  playerName
}) => {
  const { champions } = useChampions();
  const playerActions = usePlayerActions(team, playerId);
  const blueTeam = useTeamData('blue');
  const redTeam = useTeamData('red');
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Get all champions that are already selected by any player on both teams
  const selectedChampions = useMemo(() => {
    const selected = new Set<string>();
    
    [...blueTeam.players, ...redTeam.players].forEach(player => {
      if (player.champion) {
        selected.add(player.champion.id);
      }
    });
    
    return selected;
  }, [blueTeam.players, redTeam.players]);

  // Get available roles from all champions
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    Object.values(champions).forEach(champion => {
      champion.tags.forEach(tag => roles.add(tag));
    });
    return Array.from(roles).sort();
  }, [champions]);

  // Filter champions based on search and role
  const filteredChampions = useMemo(() => {
    return Object.values(champions).filter(champion => {
      const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           champion.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || champion.tags.includes(selectedRole);
      
      return matchesSearch && matchesRole;
    });
  }, [champions, searchTerm, selectedRole]);

  const favoriteChampions = filteredChampions.filter(champion => isFavorite(champion.id));

  const handleChampionSelect = (champion: ChampionSummary) => {
    // Check if champion is already selected
    if (selectedChampions.has(champion.id)) {
      return; // Don't allow selection
    }
    
    // Add champion to player
    playerActions.setChampion(champion);
    onClose();
  };

  const handleChampionClick = (champion: ChampionSummary) => {
    handleChampionSelect(champion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-riot-dark border border-gray-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Select Champion for {playerName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search champions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 bg-riot-gray border border-gray-500 rounded text-white placeholder-gray-400 focus:border-riot-blue focus:outline-none"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 bg-riot-gray border border-gray-500 rounded text-white focus:border-riot-blue focus:outline-none"
              >
                <option value="">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Favorite Champions */}
          {favoriteChampions.length > 0 && (
            <section className="px-4 pt-4">
              <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">
                ⭐ Favorites ({favoriteChampions.length})
              </h3>
              <div className="space-y-2 mb-4">
                {favoriteChampions.map((champion) => {
                  const isUnavailable = selectedChampions.has(champion.id);
                  return (
                    <div
                      key={champion.id}
                      className={`relative ${isUnavailable ? 'opacity-50' : ''}`}
                    >
                      <ChampionCard
                        champion={champion}
                        isFavorite={isFavorite(champion.id)}
                        onToggleFavorite={toggleFavorite}
                        onClick={isUnavailable ? () => {} : handleChampionClick}
                      />
                      {isUnavailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                            Already Selected
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* All Champions */}
          <section className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              All Champions ({filteredChampions.length})
            </h3>
            
            <div className="space-y-2">
              {filteredChampions.map((champion) => {
                const isUnavailable = selectedChampions.has(champion.id);
                return (
                  <div
                    key={champion.id}
                    className={`relative ${isUnavailable ? 'opacity-50' : ''}`}
                  >
                    <ChampionCard
                      champion={champion}
                      isFavorite={isFavorite(champion.id)}
                      onToggleFavorite={toggleFavorite}
                      onClick={isUnavailable ? () => {} : handleChampionClick}
                    />
                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Already Selected
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredChampions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No champions found matching your criteria.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChampionSelector;