'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useChampions } from '@/hooks/useChampions';
import { useChampionPositions } from '@/hooks/useChampionPositions';
import { useFavorites } from '@/hooks/useFavorites';
import { useChampionInfo } from '@/contexts/ChampionInfoContext';
import { useSummonerSpells } from '@/hooks/useSummonerSpells';
import { useItems } from '@/hooks/useItems';
import { ChampionSummary } from '@/types/champion';
import { SummonerSpellSummary } from '@/types/summonerSpell';
import { Position } from '@/types/team';
import TeamView from '@/components/teams/TeamView';
import { ItemSummary } from '@/hooks/useItems';
import ChampionCard from '@/components/ChampionCard';
import ChampionModal from '@/components/ChampionModal';
import FavoriteChampionCard from '@/components/FavoriteChampionCard';
import SummonerSpellCard from '@/components/SummonerSpellCard';
import SummonerSpellModal from '@/components/SummonerSpellModal';
import ItemCard from '@/components/ItemCard';
import ItemModal from '@/components/ItemModal';
import PositionIcon from '@/components/PositionIcon';
import { riotApi } from '@/lib/riot-api';

export default function ChampionsPage() {
  const { champions, loading, error, refreshChampions } = useChampions();
  const { getChampionPosition } = useChampionPositions();
  const { isFavorite, toggleFavorite, favoriteCount } = useFavorites();
  const { getChampionInfo } = useChampionInfo();
  const { summonerSpells, loading: spellsLoading, error: spellsError, refreshSummonerSpells } = useSummonerSpells();
  const { items, loading: itemsLoading, error: itemsError, refreshItems } = useItems();
  const [selectedChampion, setSelectedChampion] = useState<ChampionSummary | null>(null);
  const [selectedSummonerSpell, setSelectedSummonerSpell] = useState<SummonerSpellSummary | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | ''>('');
  const [activeTab, setActiveTab] = useState<'champions' | 'spells' | 'items' | 'teams'>('champions');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter champions based on search term and position
  const filteredChampions = champions.filter(champion => {
    const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         champion.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!selectedPosition) return matchesSearch;
    
    const championPosition = getChampionPosition(champion.id);
    if (!championPosition) return matchesSearch; // If no position data, don't filter out
    
    const positionToMatch = (selectedPosition.charAt(0).toUpperCase() + selectedPosition.slice(1)) as 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support';
    const matchesPosition = championPosition.primary === positionToMatch ||
                           (championPosition.secondary && championPosition.secondary.includes(positionToMatch));
    
    return matchesSearch && matchesPosition;
  });

  // Filter summoner spells based on search term
  const filteredSummonerSpells = summonerSpells.filter(spell =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spell.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.plaintext.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get favorite champions (for the favorites section)
  const favoriteChampions = filteredChampions.filter(champion => isFavorite(champion.id));

  const handleChampionClick = (champion: ChampionSummary) => {
    setSelectedChampion(champion);
  };

  const handleSummonerSpellClick = (summonerSpell: SummonerSpellSummary) => {
    setSelectedSummonerSpell(summonerSpell);
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleItemClick = (item: ItemSummary) => {
    setSelectedItem(item);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      if (activeTab === 'champions') {
        await refreshChampions();
      } else if (activeTab === 'spells') {
        refreshSummonerSpells();
      } else if (activeTab === 'items') {
        refreshItems();
      }
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  if (
    (activeTab === 'champions' && loading) || 
    (activeTab === 'spells' && spellsLoading) || 
    (activeTab === 'items' && itemsLoading)
  ) {
    return (
      <div className="min-h-screen bg-riot-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-riot-blue mx-auto mb-4"></div>
          <p className="text-riot-gold">Loading {activeTab}...</p>
        </div>
      </div>
    );
  }

  if (
    (activeTab === 'champions' && error) || 
    (activeTab === 'spells' && spellsError) || 
    (activeTab === 'items' && itemsError)
  ) {
    const currentError = activeTab === 'champions' ? error : activeTab === 'spells' ? spellsError : itemsError;
    const tabName = activeTab === 'champions' ? 'Champions' : activeTab === 'spells' ? 'Summoner Spells' : 'Items';
    
    return (
      <div className="min-h-screen bg-riot-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading {tabName}</h2>
          <p className="text-gray-400 mb-4">{currentError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-riot-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-riot-gray border-t border-gray-700 z-50">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('champions')}
            className={`flex-1 py-3 text-center ${activeTab === 'champions' ? 'bg-riot-blue text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
          >
            <div className="text-lg">🏆</div>
            <div className="text-xs">Champions</div>
          </button>
          <button 
            onClick={() => setActiveTab('spells')}
            className={`flex-1 py-3 text-center ${activeTab === 'spells' ? 'bg-riot-blue text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
          >
            <div className="text-lg">⚔️</div>
            <div className="text-xs">Spells</div>
          </button>
          <button 
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-3 text-center ${activeTab === 'items' ? 'bg-riot-blue text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
          >
            <div className="text-lg">🛡️</div>
            <div className="text-xs">Items</div>
          </button>
          <button 
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-3 text-center ${activeTab === 'teams' ? 'bg-riot-blue text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
          >
            <div className="text-lg">🏛️</div>
            <div className="text-xs">Teams</div>
          </button>
        </div>
      </nav>

      {/* Header with Search */}
      <header className="bg-riot-gray shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">
              {activeTab === 'champions' ? 'LoL Champions' : 
               activeTab === 'spells' ? 'Summoner Spells' : 
               activeTab === 'items' ? 'Items' : 'Teams'}
            </h1>
            <div className="flex items-center gap-3">
              <Link 
                href="/esports"
                className="px-3 py-1 border border-blue-600 text-white rounded-full text-xs hover:bg-blue-600/10 transition-colors"
              >
                🏆 Esports
              </Link>
              <div className="flex flex-col items-end">
                <button
                  onClick={handleRefresh}
                  disabled={isSyncing}
                  className={`px-3 py-1 border rounded-full text-xs transition-colors flex items-center space-x-1 ${
                    syncError
                      ? 'border-red-600 text-red-400 hover:bg-red-600/10'
                      : isSyncing 
                      ? 'border-green-600 text-white opacity-75 cursor-not-allowed' 
                      : 'border-green-600 text-white hover:bg-green-600/10'
                  }`}
                >
                  <span className={isSyncing ? 'animate-spin' : ''}>
                    {syncError ? '⚠️' : '🔄'}
                  </span>
                  <span>
                    {syncError ? 'Retry' : isSyncing ? 'Syncing...' : 'Sync'}
                  </span>
                </button>
                {(lastSyncTime || syncError) && (
                  <div className={`text-xs mt-1 ${syncError ? 'text-red-400' : 'text-gray-400'}`}>
                    {syncError || (lastSyncTime && lastSyncTime.toLocaleTimeString())}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            {activeTab !== 'teams' && (
              <>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={
                    activeTab === 'champions' ? 'Search champions...' : 
                    activeTab === 'spells' ? 'Search summoner spells...' : 
                    'Search items...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-14 bg-riot-dark border border-gray-600 rounded-full text-riot-gold placeholder-gray-400 focus:outline-none focus:border-riot-blue"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      // Blur the input to deselect it
                      searchInputRef.current?.blur();
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all text-xl"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
            
            {/* Position filters for champions */}
            {activeTab === 'champions' && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedPosition('')}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${
                    selectedPosition === '' 
                      ? 'bg-riot-blue text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Positions
                </button>
                {(['top', 'jungle', 'mid', 'bot', 'support'] as Position[]).map(position => (
                  <button
                    key={position}
                    onClick={() => setSelectedPosition(selectedPosition === position ? '' : position)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-colors ${
                      selectedPosition === position 
                        ? 'bg-riot-blue text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <PositionIcon position={position} size={14} />
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {activeTab === 'champions' && (
          <>
            {/* Favorites Section */}
            {favoriteChampions.length > 0 && (
              <section className="bg-gradient-to-r from-blue-900 to-purple-800 mx-4 my-4 rounded-lg border border-blue-700/50">
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-blue-200 mb-3 flex items-center">
                    ⭐ FAVORITES ({favoriteCount})
                  </h2>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {favoriteChampions.map((champion) => {
                      const championInfo = getChampionInfo(champion.id);
                      return (
                        <FavoriteChampionCard
                          key={champion.id}
                          champion={champion}
                          onClick={handleChampionClick}
                          playerName={championInfo.playerName}
                        />
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* All Champions List */}
            <section className="px-4 pt-6">
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                All Champions ({filteredChampions.length})
              </h2>
              
              <div className="space-y-2">
                {filteredChampions.map((champion) => (
                  <ChampionCard
                    key={champion.id}
                    champion={champion}
                    isFavorite={isFavorite(champion.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={handleChampionClick}
                  />
                ))}
              </div>

              {filteredChampions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No champions found matching "{searchTerm}"</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'spells' && (
          <>
            {/* All Summoner Spells List */}
            <section className="px-4 pt-6">
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                All Summoner Spells ({filteredSummonerSpells.length})
              </h2>
              
              <div className="space-y-2">
                {filteredSummonerSpells.map((spell) => (
                  <SummonerSpellCard
                    key={spell.id}
                    summonerSpell={spell}
                    onClick={handleSummonerSpellClick}
                  />
                ))}
              </div>

              {filteredSummonerSpells.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No summoner spells found matching "{searchTerm}"</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'items' && (
          <>
            {/* All Items List */}
            <section className="px-4 pt-6">
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                All Items ({filteredItems.length})
              </h2>
              
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={handleItemClick}
                  />
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No items found matching "{searchTerm}"</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'teams' && (
          <TeamView />
        )}
      </main>

      {/* Champion Detail Modal */}
      {selectedChampion && (
        <ChampionModal
          champion={selectedChampion}
          isOpen={!!selectedChampion}
          onClose={() => setSelectedChampion(null)}
          isFavorite={isFavorite(selectedChampion.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Summoner Spell Detail Modal */}
      {selectedSummonerSpell && (
        <SummonerSpellModal
          summonerSpell={selectedSummonerSpell}
          isOpen={!!selectedSummonerSpell}
          onClose={() => setSelectedSummonerSpell(null)}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}