import { useState, useEffect } from 'react';
import { SummonerSpellSummary } from '@/types/summonerSpell';
import { riotApi } from '@/lib/riot-api';

export const useSummonerSpells = () => {
  const [summonerSpells, setSummonerSpells] = useState<SummonerSpellSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummonerSpells = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await riotApi.getSummonerSpells();
      
      // Convert the data object to an array and sort by name
      const spellsArray: SummonerSpellSummary[] = Object.values(response.data)
        .map(spell => ({
          id: spell.id,
          name: spell.name,
          description: spell.description,
          cooldownBurn: spell.cooldownBurn,
          summonerLevel: spell.summonerLevel,
          modes: spell.modes,
          image: spell.image,
          key: spell.key
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setSummonerSpells(spellsArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summoner spells';
      setError(errorMessage);
      console.error('Error fetching summoner spells:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummonerSpells();
  }, []);

  const refreshSummonerSpells = () => {
    fetchSummonerSpells();
  };

  return {
    summonerSpells,
    loading,
    error,
    refreshSummonerSpells
  };
};