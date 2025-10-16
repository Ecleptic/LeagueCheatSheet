// Esports-related TypeScript interfaces
// Moved from src/components/esports/EsportsUI.tsx for better organization

export interface LoadingSpinnerProps {
  message?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

// Re-export API types for convenience
export type {
  League,
  Tournament, 
  Team,
  Player,
  Match,
  Standing
} from '../lib/esports/api';

// Live game stats types (from feed.lolesports.com/livestats/v1)
// Based on AndyDanger/live-lol-esports implementation

export interface WindowParticipant {
  participantId: number;
  totalGold: number;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  creepScore: number;
  currentHealth: number;
  maxHealth: number;
}

export interface TeamStats {
  totalGold: number;
  inhibitors: number;
  towers: number;
  barons: number;
  totalKills: number;
  dragons: string[]; // e.g., ["cloud", "infernal", "mountain"]
  participants: WindowParticipant[];
}

export interface WindowFrame {
  rfc460Timestamp: string;
  gameState: 'in_game' | 'paused' | 'finished';
  blueTeam: TeamStats;
  redTeam: TeamStats;
}

export interface ParticipantMetadata {
  participantId: number;
  esportsPlayerId: string;
  summonerName: string;
  championId: string;
  role: string;
}

export interface TeamMetadata {
  esportsTeamId: string;
  participantMetadata: ParticipantMetadata[];
}

export interface GameMetadata {
  patchVersion: string;
  blueTeamMetadata: TeamMetadata;
  redTeamMetadata: TeamMetadata;
}

export interface LiveGameWindow {
  esportsGameId: string;
  esportsMatchId: string;
  gameMetadata: GameMetadata;
  frames: WindowFrame[];
}

// Detailed live game stats (from /details endpoint)
export interface DetailedParticipant extends WindowParticipant {
  championDamageShare: number;
  killParticipation: number;
  attackDamage: number;
  abilityPower: number;
  attackSpeed: number;
  lifeSteal: number;
  armor: number;
  magicResistance: number;
  wardsDestroyed: number;
  wardsPlaced: number;
  items: number[];
}

export interface DetailsFrame {
  participantId: number;
  participants: DetailedParticipant[];
}

export interface LiveGameDetails {
  esportsGameId: string;
  esportsMatchId: string;
  frames: DetailsFrame[];
}

// Dragon types for visual display
export type DragonType = 'cloud' | 'infernal' | 'mountain' | 'ocean' | 'hextech' | 'chemtech' | 'elder';

// Event types for toast notifications
export interface GameEvent {
  type: 'kill' | 'first_blood' | 'tower' | 'inhibitor' | 'dragon' | 'baron';
  team: 'blue' | 'red';
  timestamp: string;
  killerName?: string;
  victimName?: string;
  dragonType?: DragonType;
  data?: {
    championId?: string;
    killCount?: number;
  };
}