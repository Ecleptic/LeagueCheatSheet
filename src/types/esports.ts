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