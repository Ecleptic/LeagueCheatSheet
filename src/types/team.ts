import { ChampionSummary, Item } from './champion';
import { SummonerSpell } from './summonerSpell';

export type Position = 'top' | 'jungle' | 'mid' | 'bot' | 'support';

export interface ItemSlot {
  id: number; // 0-5 for items, 6 for boots
  item?: Item;
  isEmpty: boolean;
}

export interface Player {
  id: string;
  name: string;
  position?: Position;
  champion?: ChampionSummary;
  summonerSpells: [SummonerSpell?, SummonerSpell?];
  items: ItemSlot[];
  gold: number;
  level: number;
}

export interface Team {
  id: string;
  name: string;
  color: 'blue' | 'red';
  players: Player[]; // exactly 5 players
}

export interface GameState {
  blueTeam: Team;
  redTeam: Team;
  gameTime: number; // in minutes
  phase: 'draft' | 'early' | 'mid' | 'late';
}

export type GamePhase = 'draft' | 'early' | 'mid' | 'late';
export type TeamBuilderStep = 'team-names' | 'player-setup' | 'champion-selection' | 'summoner-spells' | 'complete';

export interface TeamBuilderState {
  currentStep: TeamBuilderStep;
  completedSteps: TeamBuilderStep[];
  blueTeamName: string;
  redTeamName: string;
  playersSetup: boolean;
  championsSelected: boolean;
  summonerSpellsSelected: boolean;
}

export interface TeamConfiguration {
  id: string;
  name: string;
  description?: string;
  gameState: GameState;
  builderState?: TeamBuilderState;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to create empty player
export const createEmptyPlayer = (id: string, name: string, position?: Position): Player => ({
  id,
  name,
  position,
  summonerSpells: [undefined, undefined],
  items: Array.from({ length: 7 }, (_, i) => ({
    id: i,
    isEmpty: true
  })),
  gold: 500, // Starting gold
  level: 1
});

// Helper function to create empty team
export const createEmptyTeam = (color: 'blue' | 'red'): Team => {
  const positions: Position[] = ['top', 'jungle', 'mid', 'bot', 'support'];
  return {
    id: `${color}-team-${Date.now()}`,
    name: `${color.charAt(0).toUpperCase() + color.slice(1)} Team`,
    color,
    players: Array.from({ length: 5 }, (_, i) => 
      createEmptyPlayer(`${color}-player-${i}`, `Player ${i + 1}`, positions[i])
    )
  };
};

// Helper function to create default team builder state
export const createDefaultTeamBuilderState = (): TeamBuilderState => ({
  currentStep: 'team-names',
  completedSteps: [],
  blueTeamName: '',
  redTeamName: '',
  playersSetup: false,
  championsSelected: false,
  summonerSpellsSelected: false
});

// Helper function to create default game state
export const createDefaultGameState = (): GameState => ({
  blueTeam: createEmptyTeam('blue'),
  redTeam: createEmptyTeam('red'),
  gameTime: 0,
  phase: 'draft'
});