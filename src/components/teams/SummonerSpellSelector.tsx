'use client';

import React, { useState, useMemo } from 'react';
import { SummonerSpell, SummonerSpellSummary } from '@/types/summonerSpell';
import { useSummonerSpells } from '@/hooks/useSummonerSpells';
import { usePlayerActions } from '@/hooks/useTeamActions';
import SummonerSpellImage from '@/components/ui/SummonerSpellImage';

interface SummonerSpellSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  team: 'blue' | 'red';
  playerId: string;
  playerName: string;
  spellSlot: 0 | 1;
}

const SummonerSpellSelector: React.FC<SummonerSpellSelectorProps> = ({
  isOpen,
  onClose,
  team,
  playerId,
  playerName,
  spellSlot
}) => {
  const { summonerSpells } = useSummonerSpells();
  const playerActions = usePlayerActions(team, playerId);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Convert SummonerSpellSummary to SummonerSpell for team actions
  const convertToFullSpell = (summarySpell: SummonerSpellSummary): SummonerSpell => {
    // Create a minimal SummonerSpell that satisfies the interface
    return {
      id: summarySpell.id,
      name: summarySpell.name,
      description: summarySpell.description,
      tooltip: summarySpell.description, // Use description as tooltip
      maxrank: 1,
      cooldown: [0], // Will be properly set if available
      cooldownBurn: summarySpell.cooldownBurn || '0',
      cost: [0],
      costBurn: '0',
      datavalues: {},
      effect: [],
      effectBurn: [],
      vars: [],
      key: summarySpell.key,
      summonerLevel: summarySpell.summonerLevel,
      modes: summarySpell.modes || [],
      costType: 'No Cost',
      maxammo: '-1',
      range: [0],
      rangeBurn: '0',
      image: summarySpell.image,
      resource: 'No Cost'
    };
  };

  // Filter summoner spells based on search
  const filteredSpells = useMemo(() => {
    return Object.values(summonerSpells).filter(spell => 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [summonerSpells, searchTerm]);

  // Common spell combinations for suggestions
  const commonCombinations = useMemo(() => {
    const combinations = [
      { name: 'ADC Standard', spells: ['Flash', 'Heal'] },
      { name: 'Support', spells: ['Flash', 'Exhaust'] },
      { name: 'Support Alt', spells: ['Flash', 'Ignite'] },
      { name: 'Mid Lane', spells: ['Flash', 'Teleport'] },
      { name: 'Mid Assassin', spells: ['Flash', 'Ignite'] },
      { name: 'Top Lane', spells: ['Flash', 'Teleport'] },
      { name: 'Top Bruiser', spells: ['Flash', 'Ignite'] },
      { name: 'Jungle', spells: ['Flash', 'Smite'] },
      { name: 'Jungle Alt', spells: ['Ghost', 'Smite'] },
    ];
    
    return combinations.filter(combo => {
      // Only show combinations that include the spell we're looking for
      return combo.spells.some(spellName => 
        Object.values(summonerSpells).some(spell => 
          spell.name === spellName
        )
      );
    });
  }, [summonerSpells]);

  const handleSpellSelect = (spell: SummonerSpellSummary) => {
    const fullSpell = convertToFullSpell(spell);
    playerActions.setSummonerSpell(spellSlot, fullSpell);
    onClose();
  };

  const handleSpellClick = (spell: SummonerSpellSummary) => {
    handleSpellSelect(spell);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-riot-dark border border-gray-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Select Summoner Spell for {playerName} (Slot {spellSlot + 1})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search summoner spells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-riot-gray border border-gray-500 rounded text-white placeholder-gray-400 focus:border-riot-blue focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Common Combinations */}
          {commonCombinations.length > 0 && (
            <section className="px-4 pt-4">
              <h3 className="text-sm font-semibold text-riot-blue mb-3 uppercase tracking-wide">
                💡 Common Combinations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {commonCombinations.map((combo) => (
                  <div
                    key={combo.name}
                    className="bg-riot-gray/50 rounded border border-gray-600 p-3"
                  >
                    <div className="text-sm font-medium text-white mb-2">{combo.name}</div>
                    <div className="flex gap-1">
                      {combo.spells.map((spellName) => {
                        const spell = Object.values(summonerSpells).find(s => s.name === spellName);
                        return spell ? (
                          <SummonerSpellImage
                            key={spell.id}
                            spellImageFull={spell.image.full}
                            alt={spell.name}
                            className="w-8 h-8 rounded border border-gray-500"
                          />
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Summoner Spells */}
          <section className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              All Summoner Spells ({filteredSpells.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredSpells.map((spell) => (
                <div
                  key={spell.id}
                  className="bg-riot-gray/50 rounded border border-gray-600 p-3 hover:bg-riot-gray/70 cursor-pointer transition-colors"
                  onClick={() => handleSpellClick(spell)}
                >
                  <div className="flex items-center gap-3">
                    <SummonerSpellImage
                      spellImageFull={spell.image.full}
                      alt={spell.name}
                      className="w-12 h-12 rounded border border-gray-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{spell.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">
                        {spell.description.replace(/<[^>]*>/g, '')}
                      </div>
                      <div className="text-xs text-riot-blue mt-1">
                        Cooldown: {spell.cooldownBurn || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSpells.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No summoner spells found matching your search.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SummonerSpellSelector;