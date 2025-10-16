// React hooks for LoL Esports API
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { esportsApi, League, Match, Standing } from '@/lib/esports/api';
import { LiveGameWindow, LiveGameDetails, WindowFrame, GameEvent, GameMetadata, DragonType } from '@/types/esports';

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

/**
 * Hook for fetching and auto-updating live game statistics
 * Polls the window API every 1 second for real-time updates (matching AndyDanger's 500ms but being less aggressive)
 * Includes event detection for toast notifications
 */
export function useLiveGameStats(gameId: string | number | null) {
  const [windowData, setWindowData] = useState<LiveGameWindow | null>(null);
  const [detailsData, setDetailsData] = useState<LiveGameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string>('');
  const [events, setEvents] = useState<GameEvent[]>([]);
  
  // Keep track of previous frame for event detection
  const previousFrameRef = useRef<WindowFrame | null>(null);

  // Fetch window data (team stats, gold, objectives)
  const fetchWindow = useCallback(async (currentGameId: string | number, timestamp?: string) => {
    try {
      const data = await esportsApi.getLiveGameStats(currentGameId, timestamp);
      
      if (data && data.frames && data.frames.length > 0) {
        setWindowData(data);
        const latestFrame = data.frames[data.frames.length - 1];
        // Round timestamp to 10 seconds before storing (API requirement)
        const roundedTimestamp = roundTimestampTo10Seconds(latestFrame.rfc460Timestamp);
        setLastTimestamp(roundedTimestamp);
        
        // Detect events for notifications
        if (previousFrameRef.current) {
          const detectedEvents = detectGameEvents(previousFrameRef.current, latestFrame, data.gameMetadata);
          if (detectedEvents.length > 0) {
            setEvents(prev => [...prev, ...detectedEvents]);
          }
        }
        
        previousFrameRef.current = latestFrame;
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to fetch live game window:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch live game data');
      return false;
    }
  }, []);

  // Fetch details data (player stats, items, runes)
  const fetchDetails = useCallback(async (currentGameId: string | number, timestamp?: string) => {
    try {
      const data = await esportsApi.getLiveGameDetails(currentGameId, timestamp);
      
      if (data && data.frames) {
        setDetailsData(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to fetch live game details:', err);
      // Details are optional, don't set error state
      return false;
    }
  }, []);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    let isActive = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let pollCount = 0;

    async function initialFetch() {
      setLoading(true);
      // Always use a safe timestamp (30 seconds in the past) to avoid API errors
      const safeTimestamp = getISODateMultiplyOf10();
      const windowSuccess = await fetchWindow(gameId!, safeTimestamp);
      if (windowSuccess) {
        // Fetch details after window succeeds
        await fetchDetails(gameId!, safeTimestamp);
      }
      setLoading(false);
    }

    async function pollData() {
      if (!isActive || !gameId) return;

      // Use last timestamp to get incremental updates
      const timestamp = lastTimestamp || getISODateMultiplyOf10();
      await fetchWindow(gameId, timestamp);
      
      // Fetch details less frequently (every 3 polls) to reduce API load
      pollCount++;
      if (pollCount % 3 === 0) {
        await fetchDetails(gameId, timestamp);
      }
    }

    initialFetch();

    // Poll every 1 second for updates (AndyDanger uses 500ms but 1s is more reasonable)
    pollInterval = setInterval(pollData, 1000);

    return () => {
      isActive = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [gameId, fetchWindow, fetchDetails, lastTimestamp]);

  // Get the latest frame from window data
  const latestFrame = windowData?.frames?.[windowData.frames.length - 1] || null;
  const firstFrame = windowData?.frames?.[0] || null;

  // Clear consumed events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    windowData,
    detailsData,
    latestFrame,
    firstFrame,
    gameMetadata: windowData?.gameMetadata || null,
    loading,
    error,
    events,
    clearEvents,
    refetch: () => gameId && fetchWindow(gameId),
  };
}

/**
 * Detect game events by comparing previous and current frames
 * Used for toast notifications
 */
function detectGameEvents(
  previousFrame: WindowFrame,
  currentFrame: WindowFrame,
  metadata: GameMetadata
): GameEvent[] {
  const events: GameEvent[] = [];
  const timestamp = currentFrame.rfc460Timestamp;

  // Check for kills (first blood and regular kills)
  const blueKillsIncrease = currentFrame.blueTeam.totalKills - previousFrame.blueTeam.totalKills;
  const redKillsIncrease = currentFrame.redTeam.totalKills - previousFrame.redTeam.totalKills;

  if (blueKillsIncrease > 0) {
    // Check if it's first blood
    if (previousFrame.blueTeam.totalKills === 0 && previousFrame.redTeam.totalKills === 0) {
      events.push({ type: 'first_blood', team: 'blue', timestamp, data: { killCount: blueKillsIncrease } });
    } else {
      events.push({ type: 'kill', team: 'blue', timestamp, data: { killCount: blueKillsIncrease } });
    }
  }

  if (redKillsIncrease > 0) {
    if (previousFrame.blueTeam.totalKills === 0 && previousFrame.redTeam.totalKills === 0) {
      events.push({ type: 'first_blood', team: 'red', timestamp, data: { killCount: redKillsIncrease } });
    } else {
      events.push({ type: 'kill', team: 'red', timestamp, data: { killCount: redKillsIncrease } });
    }
  }

  // Check for towers
  if (currentFrame.blueTeam.towers > previousFrame.blueTeam.towers) {
    events.push({ type: 'tower', team: 'blue', timestamp });
  }
  if (currentFrame.redTeam.towers > previousFrame.redTeam.towers) {
    events.push({ type: 'tower', team: 'red', timestamp });
  }

  // Check for inhibitors
  if (currentFrame.blueTeam.inhibitors > previousFrame.blueTeam.inhibitors) {
    events.push({ type: 'inhibitor', team: 'blue', timestamp });
  }
  if (currentFrame.redTeam.inhibitors > previousFrame.redTeam.inhibitors) {
    events.push({ type: 'inhibitor', team: 'red', timestamp });
  }

  // Check for dragons
  if (currentFrame.blueTeam.dragons.length > previousFrame.blueTeam.dragons.length) {
    const newDragon = currentFrame.blueTeam.dragons[currentFrame.blueTeam.dragons.length - 1];
    events.push({ 
      type: 'dragon', 
      team: 'blue',
      timestamp,
      dragonType: newDragon as DragonType
    });
  }
  if (currentFrame.redTeam.dragons.length > previousFrame.redTeam.dragons.length) {
    const newDragon = currentFrame.redTeam.dragons[currentFrame.redTeam.dragons.length - 1];
    events.push({ 
      type: 'dragon', 
      team: 'red',
      timestamp,
      dragonType: newDragon as DragonType
    });
  }

  // Check for baron
  if (currentFrame.blueTeam.barons > previousFrame.blueTeam.barons) {
    events.push({ type: 'baron', team: 'blue', timestamp });
  }
  if (currentFrame.redTeam.barons > previousFrame.redTeam.barons) {
    events.push({ type: 'baron', team: 'red', timestamp });
  }

  return events;
}

/**
 * Round any ISO timestamp to the nearest 10-second boundary
 * The API requires all timestamps to be evenly divisible by 10 seconds
 */
function roundTimestampTo10Seconds(timestamp: string): string {
  const date = new Date(timestamp);
  const seconds = Math.floor(date.getTime() / 1000);
  const roundedSeconds = Math.floor(seconds / 10) * 10;
  return new Date(roundedSeconds * 1000).toISOString();
}

/**
 * Get ISO timestamp rounded to the nearest 10 seconds, offset by 30 seconds in the past
 * The API requires timestamps to be at least 20 seconds old to avoid "ahead of broadcast" errors
 * We use 30 seconds to provide a safe buffer
 * (adapted from AndyDanger's implementation with API requirement fix)
 */
function getISODateMultiplyOf10(): string {
  const now = new Date();
  const seconds = Math.floor(now.getTime() / 1000);
  // Subtract 30 seconds to ensure we're safely in the past (API requires 20+ seconds)
  const roundedSeconds = Math.floor((seconds - 30) / 10) * 10;
  return new Date(roundedSeconds * 1000).toISOString();
}