'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Team, Player, createDefaultGameState } from '../types/team';
import { ChampionSummary, Item } from '../types/champion';
import { SummonerSpell } from '../types/summonerSpell';

// Action types for the reducer
export type TeamAction =
  | { type: 'RESET_GAME' }
  | { type: 'SET_GAME_TIME'; time: number }
  | { type: 'SET_GAME_PHASE'; phase: 'draft' | 'early' | 'mid' | 'late' }
  | { type: 'SET_TEAM_NAME'; team: 'blue' | 'red'; name: string }
  | { type: 'SET_PLAYER_NAME'; team: 'blue' | 'red'; playerId: string; name: string }
  | { type: 'SET_PLAYER_CHAMPION'; team: 'blue' | 'red'; playerId: string; champion: ChampionSummary }
  | { type: 'REMOVE_PLAYER_CHAMPION'; team: 'blue' | 'red'; playerId: string }
  | { type: 'SET_SUMMONER_SPELL'; team: 'blue' | 'red'; playerId: string; slot: 0 | 1; spell: SummonerSpell }
  | { type: 'REMOVE_SUMMONER_SPELL'; team: 'blue' | 'red'; playerId: string; slot: 0 | 1 }
  | { type: 'ADD_ITEM'; team: 'blue' | 'red'; playerId: string; item: Item; slot: number }
  | { type: 'REMOVE_ITEM'; team: 'blue' | 'red'; playerId: string; slot: number }
  | { type: 'MOVE_ITEM'; team: 'blue' | 'red'; playerId: string; fromSlot: number; toSlot: number }
  | { type: 'SET_PLAYER_GOLD'; team: 'blue' | 'red'; playerId: string; gold: number }
  | { type: 'SET_PLAYER_LEVEL'; team: 'blue' | 'red'; playerId: string; level: number }
  | { type: 'LOAD_GAME_STATE'; gameState: GameState };

// Context interface
interface TeamContextType {
  gameState: GameState;
  dispatch: React.Dispatch<TeamAction>;
}

// Create context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Reducer function
const teamReducer = (state: GameState, action: TeamAction): GameState => {
  switch (action.type) {
    case 'RESET_GAME':
      return createDefaultGameState();

    case 'SET_GAME_TIME':
      return { ...state, gameTime: action.time };

    case 'SET_GAME_PHASE':
      return { ...state, phase: action.phase };

    case 'SET_TEAM_NAME':
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...state[action.team === 'blue' ? 'blueTeam' : 'redTeam'],
          name: action.name
        }
      };

    case 'SET_PLAYER_NAME': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player =>
        player.id === action.playerId ? { ...player, name: action.name } : player
      );
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'SET_PLAYER_CHAMPION': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player =>
        player.id === action.playerId ? { ...player, champion: action.champion } : player
      );
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'REMOVE_PLAYER_CHAMPION': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player =>
        player.id === action.playerId ? { ...player, champion: undefined } : player
      );
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'SET_SUMMONER_SPELL': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player => {
        if (player.id === action.playerId) {
          const newSpells = [...player.summonerSpells] as [SummonerSpell?, SummonerSpell?];
          newSpells[action.slot] = action.spell;
          return { ...player, summonerSpells: newSpells };
        }
        return player;
      });
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'REMOVE_SUMMONER_SPELL': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player => {
        if (player.id === action.playerId) {
          const newSpells = [...player.summonerSpells] as [SummonerSpell?, SummonerSpell?];
          newSpells[action.slot] = undefined;
          return { ...player, summonerSpells: newSpells };
        }
        return player;
      });
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'ADD_ITEM': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player => {
        if (player.id === action.playerId) {
          const newItems = [...player.items];
          newItems[action.slot] = { 
            id: action.slot, 
            item: action.item, 
            isEmpty: false 
          };
          return { ...player, items: newItems };
        }
        return player;
      });
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'REMOVE_ITEM': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player => {
        if (player.id === action.playerId) {
          const newItems = [...player.items];
          newItems[action.slot] = { 
            id: action.slot, 
            isEmpty: true 
          };
          return { ...player, items: newItems };
        }
        return player;
      });
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'MOVE_ITEM': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player => {
        if (player.id === action.playerId) {
          const newItems = [...player.items];
          const fromItem = newItems[action.fromSlot];
          const toItem = newItems[action.toSlot];
          
          // Swap the items
          newItems[action.fromSlot] = { ...toItem, id: action.fromSlot };
          newItems[action.toSlot] = { ...fromItem, id: action.toSlot };
          
          return { ...player, items: newItems };
        }
        return player;
      });
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'SET_PLAYER_GOLD': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player =>
        player.id === action.playerId ? { ...player, gold: action.gold } : player
      );
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'SET_PLAYER_LEVEL': {
      const team = state[action.team === 'blue' ? 'blueTeam' : 'redTeam'];
      const updatedPlayers = team.players.map(player =>
        player.id === action.playerId ? { ...player, level: Math.max(1, Math.min(18, action.level)) } : player
      );
      return {
        ...state,
        [action.team === 'blue' ? 'blueTeam' : 'redTeam']: {
          ...team,
          players: updatedPlayers
        }
      };
    }

    case 'LOAD_GAME_STATE':
      return action.gameState;

    default:
      return state;
  }
};

// Provider component
interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [gameState, dispatch] = useReducer(teamReducer, createDefaultGameState());

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lta-team-state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME_STATE', gameState: parsedState });
      } catch (error) {
        console.error('Failed to load saved team state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('lta-team-state', JSON.stringify(gameState));
  }, [gameState]);

  return (
    <TeamContext.Provider value={{ gameState, dispatch }}>
      {children}
    </TeamContext.Provider>
  );
};

// Custom hook to use the team context
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};