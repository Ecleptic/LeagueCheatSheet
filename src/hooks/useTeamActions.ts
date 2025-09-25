'use client';

import { useTeam } from '../contexts/TeamContext';
import { Player, Team } from '../types/team';
import { ChampionSummary, Item } from '../types/champion';
import { SummonerSpell } from '../types/summonerSpell';

export const useTeamActions = () => {
  const { gameState, dispatch } = useTeam();

  const actions = {
    // Game state actions
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    setGameTime: (time: number) => dispatch({ type: 'SET_GAME_TIME', time }),
    setGamePhase: (phase: 'draft' | 'early' | 'mid' | 'late') => 
      dispatch({ type: 'SET_GAME_PHASE', phase }),

    // Team actions
    setTeamName: (team: 'blue' | 'red', name: string) =>
      dispatch({ type: 'SET_TEAM_NAME', team, name }),

    // Player actions
    setPlayerName: (team: 'blue' | 'red', playerId: string, name: string) =>
      dispatch({ type: 'SET_PLAYER_NAME', team, playerId, name }),

    setPlayerChampion: (team: 'blue' | 'red', playerId: string, champion: ChampionSummary) =>
      dispatch({ type: 'SET_PLAYER_CHAMPION', team, playerId, champion }),

    removePlayerChampion: (team: 'blue' | 'red', playerId: string) =>
      dispatch({ type: 'REMOVE_PLAYER_CHAMPION', team, playerId }),

    setSummonerSpell: (team: 'blue' | 'red', playerId: string, slot: 0 | 1, spell: SummonerSpell) =>
      dispatch({ type: 'SET_SUMMONER_SPELL', team, playerId, slot, spell }),

    removeSummonerSpell: (team: 'blue' | 'red', playerId: string, slot: 0 | 1) =>
      dispatch({ type: 'REMOVE_SUMMONER_SPELL', team, playerId, slot }),

    addItem: (team: 'blue' | 'red', playerId: string, item: Item, slot: number) =>
      dispatch({ type: 'ADD_ITEM', team, playerId, item, slot }),

    removeItem: (team: 'blue' | 'red', playerId: string, slot: number) =>
      dispatch({ type: 'REMOVE_ITEM', team, playerId, slot }),

    moveItem: (team: 'blue' | 'red', playerId: string, fromSlot: number, toSlot: number) =>
      dispatch({ type: 'MOVE_ITEM', team, playerId, fromSlot, toSlot }),

    setPlayerGold: (team: 'blue' | 'red', playerId: string, gold: number) =>
      dispatch({ type: 'SET_PLAYER_GOLD', team, playerId, gold }),

    setPlayerLevel: (team: 'blue' | 'red', playerId: string, level: number) =>
      dispatch({ type: 'SET_PLAYER_LEVEL', team, playerId, level }),
  };

  return actions;
};

export const usePlayerActions = (team: 'blue' | 'red', playerId: string) => {
  const teamActions = useTeamActions();

  return {
    setName: (name: string) => teamActions.setPlayerName(team, playerId, name),
    setChampion: (champion: ChampionSummary) => teamActions.setPlayerChampion(team, playerId, champion),
    removeChampion: () => teamActions.removePlayerChampion(team, playerId),
    setSummonerSpell: (slot: 0 | 1, spell: SummonerSpell) => 
      teamActions.setSummonerSpell(team, playerId, slot, spell),
    removeSummonerSpell: (slot: 0 | 1) => 
      teamActions.removeSummonerSpell(team, playerId, slot),
    addItem: (item: Item, slot: number) => teamActions.addItem(team, playerId, item, slot),
    removeItem: (slot: number) => teamActions.removeItem(team, playerId, slot),
    moveItem: (fromSlot: number, toSlot: number) => 
      teamActions.moveItem(team, playerId, fromSlot, toSlot),
    setGold: (gold: number) => teamActions.setPlayerGold(team, playerId, gold),
    setLevel: (level: number) => teamActions.setPlayerLevel(team, playerId, level),
  };
};

// Utility hooks for getting specific data
export const usePlayer = (team: 'blue' | 'red', playerId: string): Player | undefined => {
  const { gameState } = useTeam();
  const targetTeam = team === 'blue' ? gameState.blueTeam : gameState.redTeam;
  return targetTeam.players.find(player => player.id === playerId);
};

export const useTeamData = (team: 'blue' | 'red'): Team => {
  const { gameState } = useTeam();
  return team === 'blue' ? gameState.blueTeam : gameState.redTeam;
};

// Validation hooks
export const useTeamValidation = () => {
  const { gameState } = useTeam();

  const validation = {
    // Check if a champion is already selected by any player
    isChampionTaken: (championId: string, excludePlayerId?: string): boolean => {
      const allPlayers = [...gameState.blueTeam.players, ...gameState.redTeam.players];
      return allPlayers.some(player => 
        player.champion?.id === championId && player.id !== excludePlayerId
      );
    },

    // Check if both summoner spells are set for a player
    hasCompleteSummonerSpells: (team: 'blue' | 'red', playerId: string): boolean => {
      const player = team === 'blue' 
        ? gameState.blueTeam.players.find(p => p.id === playerId)
        : gameState.redTeam.players.find(p => p.id === playerId);
      
      return !!(player?.summonerSpells[0] && player?.summonerSpells[1]);
    },

    // Check if a team has all champions selected
    isTeamComplete: (team: 'blue' | 'red'): boolean => {
      const targetTeam = team === 'blue' ? gameState.blueTeam : gameState.redTeam;
      return targetTeam.players.every(player => player.champion);
    },

    // Check if both teams are complete
    isDraftComplete: (): boolean => {
      return validation.isTeamComplete('blue') && validation.isTeamComplete('red');
    },

    // Get available item slots for a player
    getAvailableItemSlots: (team: 'blue' | 'red', playerId: string): number[] => {
      const player = team === 'blue' 
        ? gameState.blueTeam.players.find(p => p.id === playerId)
        : gameState.redTeam.players.find(p => p.id === playerId);
      
      if (!player) return [];
      
      return player.items
        .filter(slot => slot.isEmpty)
        .map(slot => slot.id);
    },

    // Calculate total gold for a team
    getTeamGold: (team: 'blue' | 'red'): number => {
      const targetTeam = team === 'blue' ? gameState.blueTeam : gameState.redTeam;
      return targetTeam.players.reduce((total, player) => total + player.gold, 0);
    },

    // Calculate total value of items for a player
    getPlayerItemValue: (team: 'blue' | 'red', playerId: string): number => {
      const player = team === 'blue' 
        ? gameState.blueTeam.players.find(p => p.id === playerId)
        : gameState.redTeam.players.find(p => p.id === playerId);
      
      if (!player) return 0;
      
      return player.items
        .filter(slot => !slot.isEmpty && slot.item)
        .reduce((total, slot) => total + (slot.item?.gold.total || 0), 0);
    }
  };

  return validation;
};