import { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';
import { ChampionSummary, ChampionsResponse } from '@/types/champion';

interface UseChampionsReturn {
  champions: ChampionSummary[];
  loading: boolean;
  error: string | null;
  refreshChampions: () => Promise<void>;
}

export function useChampions(): UseChampionsReturn {
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChampions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ChampionsResponse = await riotApi.getChampions();
      
      // Convert object to array and sort alphabetically
      const championArray = Object.values(response.data).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setChampions(championArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch champions');
    } finally {
      setLoading(false);
    }
  };

  const refreshChampions = async () => {
    // Clear cache and fetch fresh data
    riotApi.clearCache();
    await fetchChampions();
  };

  useEffect(() => {
    fetchChampions();
  }, []);

  return {
    champions,
    loading,
    error,
    refreshChampions,
  };
}