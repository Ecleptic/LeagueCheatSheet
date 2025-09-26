import { useState, useEffect } from 'react';
import { ChampionPosition } from '@/types/champion';
import { communityDragonApi } from '@/lib/community-dragon-api';

interface UseChampionPositionsReturn {
  positions: Record<string, ChampionPosition>;
  loading: boolean;
  error: string | null;
  getChampionPosition: (championId: string) => ChampionPosition | undefined;
  getChampionsByPosition: (position: 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support') => string[];
}

export function useChampionPositions(): UseChampionPositionsReturn {
  const [positions, setPositions] = useState<Record<string, ChampionPosition>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPositions() {
      try {
        setLoading(true);
        setError(null);
        const championPositions = await communityDragonApi.getChampionPositions();
        setPositions(championPositions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch champion positions');
        console.error('Error fetching champion positions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
  }, []);

  const getChampionPosition = (championId: string): ChampionPosition | undefined => {
    return positions[championId];
  };

  const getChampionsByPosition = (position: 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support'): string[] => {
    return Object.entries(positions)
      .filter(([, championPosition]) => 
        championPosition.primary === position || championPosition.secondary?.includes(position)
      )
      .map(([championId]) => championId);
  };

  return {
    positions,
    loading,
    error,
    getChampionPosition,
    getChampionsByPosition,
  };
}