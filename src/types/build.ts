import { Item, ChampionSummary } from './champion';
import { GamePhase } from './team';

export interface BuildPath {
  item: Item;
  components: Item[];
  totalCost: number;
  stepCost: number; // Cost of next immediate component
  priority: number; // 1-10, higher is more important
  canAfford: boolean;
}

export interface BuildRecommendation {
  nextItem: Item;
  alternatives: Item[];
  reasoning: string;
  costEfficiency: number;
  buildPath: BuildPath;
}

export interface BuildAnalysis {
  champion: ChampionSummary;
  currentItems: Item[];
  gamePhase: GamePhase;
  availableGold: number;
  recommendations: BuildRecommendation[];
  powerSpikes: Item[]; // Items that provide significant power increases
  situationalItems: Item[]; // Items good against enemy team comp
}

export interface ItemStats {
  [statName: string]: number;
}

export interface ItemEfficiency {
  item: Item;
  goldValue: number;
  efficiency: number; // Percentage efficiency (100% = gold efficient)
  effectiveStats: ItemStats;
}

// Build planning types
export interface BuildGoal {
  targetItem: Item;
  priority: 'high' | 'medium' | 'low';
  situational: boolean;
  reasoning: string;
}

export interface TeamBuildAnalysis {
  teamComposition: ChampionSummary[];
  totalGold: number;
  teamPowerSpikes: number[]; // Game time in minutes
  itemSynergies: string[]; // Descriptions of item synergies
  recommendations: string[]; // Team-wide build suggestions
}