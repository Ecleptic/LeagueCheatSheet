// React hooks for LoL Esports API
'use client';

import { useState, useEffect, useMemo } from 'react';
import { esportsApi, League, Match, Standing } from '@/lib/esports/api';

export function useEsportsLeagues() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        setLoading(true);
        const data = await esportsApi.getAllLeagues();
        setLeagues(data as unknown as League[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch leagues:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leagues');
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, []);

  return { leagues, loading, error };
}

export function useEsportsLive() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveMatches() {
      try {
        // Don't set loading on subsequent fetches to prevent flash
        const isInitialLoad = matches.length === 0 && loading;
        if (isInitialLoad) {
          setLoading(true);
        }
        
        // Call our Next.js API route instead of client-side API
        const response = await fetch('/api/esports/live');
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        const data = result.matches || [];
        
        console.log('🔄 [useEsportsLive] Received', data.length, 'matches from API');
        
        // Always update if data exists - stats should update every 30 seconds
        // Only skip update if both old and new are empty (no matches)
        if (data.length > 0 || matches.length > 0) {
          setMatches(data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch live matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch live matches');
      } finally {
        setLoading(false);
      }
    }

    fetchLiveMatches();
    
    // Refresh live matches every 30 seconds
    const interval = setInterval(fetchLiveMatches, 30000);
    
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { matches, loading, error };
}

export function useEsportsSchedule(leagueNames?: string[]) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable reference for league names to prevent infinite re-renders
  const stableLeagueNames = useMemo(() => {
    if (!leagueNames || leagueNames.length === 0) {
      return [];
    }
    return [...leagueNames].sort(); // Sort to ensure consistent reference
  }, [leagueNames]);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        const data = await esportsApi.getUpcomingSchedule(stableLeagueNames.length > 0 ? stableLeagueNames : undefined);
        setMatches(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [stableLeagueNames]);

  return { matches, loading, error };
}

export function useEsportsStandings(tournamentIds?: number[]) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable reference for empty array to prevent infinite re-renders
  const stableTournamentIds = useMemo(() => tournamentIds || [], [tournamentIds]);

  useEffect(() => {
    async function fetchStandings() {
      if (stableTournamentIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await esportsApi.getStandings(stableTournamentIds);
        // Process standings data from API response
        const standingsData = response.data?.standings || [];
        setStandings(standingsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch standings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch standings');
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, [stableTournamentIds]);

  return { standings, loading, error };
}

export function useEsportsResults(leagueIds?: number[]) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable reference for empty array to prevent infinite re-renders
  const stableLeagueIds = useMemo(() => leagueIds || [], [leagueIds]);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const data = await esportsApi.getRecentResults(stableLeagueIds);
        setMatches(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [stableLeagueIds]);

  return { matches, loading, error };
}