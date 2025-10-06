// LoL Esports API Integration
// Documentation: https://vickz84259.github.io/lolesports-api-docs/

const ESPORTS_API_BASE = 'https://esports-api.lolesports.com/persisted/gw';
const MATCH_DETAILS_BASE = 'https://feed.lolesports.com/livestats/v1';
const HIGHLANDER_BASE = 'https://api.lolesports.com/api/v1';
const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

interface EsportsAPIOptions {
  locale?: string;
}

// Type for API request parameters
type RequestParams = Record<string, string | number | boolean | (string | number)[] | undefined>;

// Raw API response types
interface RawEsportsEvent {
  id?: string;
  type?: string;
  startTime?: string;
  state?: 'unstarted' | 'inProgress' | 'completed';
  blockName?: string;
  league?: {
    name?: string;
    slug?: string;
    [key: string]: unknown;
  };
  match?: {
    strategy?: unknown;
    teams?: unknown[];
    flags?: unknown;
    [key: string]: unknown;
  };
  teams?: unknown[];
  streams?: unknown[];
  tournament?: unknown;
  [key: string]: unknown;
}

class EsportsAPI {
  private async request(url: string, params: RequestParams = {}) {
    const searchParams = new URLSearchParams();
    
    // Add default locale if not provided
    if (!params.hl) {
      searchParams.append('hl', 'en-US');
    }
    
    // Add all parameters
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const fullUrl = `${url}?${searchParams.toString()}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Esports API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // League endpoints
  async getLeagues(options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getLeagues`, { hl: options.locale });
  }

  async getTournamentsForLeague(leagueId: number, options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getTournamentsForLeague`, {
      leagueId,
      hl: options.locale
    });
  }

  async getStandings(tournamentIds: number[], options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getStandings`, {
      tournamentId: tournamentIds,
      hl: options.locale
    });
  }

  // Event endpoints
  async getSchedule(leagueIds: number[] = [], pageToken?: string, options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getSchedule`, {
      leagueId: leagueIds,
      pageToken,
      hl: options.locale
    });
  }

  async getLive(options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getLive`, { hl: options.locale });
  }

  async getCompletedEvents(tournamentIds: number[], options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getCompletedEvents`, {
      tournamentId: tournamentIds,
      hl: options.locale
    });
  }

  async getEventDetails(eventId: number, options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getEventDetails`, {
      id: eventId,
      hl: options.locale
    });
  }

  async getGames(gameIds: number[], options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getGames`, {
      id: gameIds,
      hl: options.locale
    });
  }

  // Team endpoints
  async getTeams(teamSlugs: string[], options: EsportsAPIOptions = {}) {
    return this.request(`${ESPORTS_API_BASE}/getTeams`, {
      id: teamSlugs,
      hl: options.locale
    });
  }

  // Live game statistics endpoints
  async getLiveGameStats(gameId: string | number, startingTime?: string) {
    const params: Record<string, string> = {};
    if (startingTime) {
      params.startingTime = startingTime;
    }
    
    const searchParams = new URLSearchParams(params);
    const url = `${MATCH_DETAILS_BASE}/window/${gameId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    console.log(`🌐 [API] Fetching live game stats from: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`📡 [API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [API] Error response body:`, errorText);
      throw new Error(`Live game stats request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ [API] Successfully fetched game stats, data keys:`, Object.keys(data));
    
    return data;
  }

  async getLiveGameDetails(gameId: string | number, startingTime?: string, participantIds?: string) {
    const params: Record<string, string> = {};
    if (startingTime) params.startingTime = startingTime;
    if (participantIds) params.participantIds = participantIds;
    
    const searchParams = new URLSearchParams(params);
    const url = `${MATCH_DETAILS_BASE}/details/${gameId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    console.log(`🌐 [API] Fetching live game details from: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`📡 [API] Details response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [API] Error response body:`, errorText);
      throw new Error(`Live game details request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ [API] Successfully fetched game details`);
    
    return data;
  }

  async getMatchWindow(gameId: number, startingTime?: string) {
    const params: Record<string, string> = {};
    if (startingTime) {
      params.startingTime = startingTime;
    }
    
    const searchParams = new URLSearchParams(params);
    const url = `${MATCH_DETAILS_BASE}/window/${gameId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Match details request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async getMatchDetails(gameId: number, startingTime?: string, participantIds?: string) {
    const params: Record<string, string> = {};
    if (startingTime) params.startingTime = startingTime;
    if (participantIds) params.participantIds = participantIds;
    
    const searchParams = new URLSearchParams(params);
    const url = `${MATCH_DETAILS_BASE}/details/${gameId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Match details request failed: ${response.status}`);
    }
    
    return response.json();
  }

  // Highlander endpoints (legacy API)
  async getNavItems() {
    const response = await fetch(`${HIGHLANDER_BASE}/navItems`);
    if (!response.ok) {
      throw new Error(`Highlander API request failed: ${response.status}`);
    }
    return response.json();
  }

  async getHighlanderLeagues(id?: string, slug?: string) {
    const params: Record<string, string> = {};
    if (id) params.id = id;
    if (slug) params.slug = slug;
    
    const searchParams = new URLSearchParams(params);
    const url = `${HIGHLANDER_BASE}/leagues${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Highlander leagues request failed: ${response.status}`);
    }
    return response.json();
  }

  // Convenience methods for common use cases
  async getAllLeagues() {
    return this.getAvailableLeagues();
  }

  // Helper method to transform raw API event data to our Match interface
  private transformEventToMatch(event: RawEsportsEvent): Match {
    const baseMatch: Match = {
      id: event.id || `${event.type}-${event.startTime}`,
      startTime: event.startTime || '',
      state: (event.state as 'unstarted' | 'inProgress' | 'completed') || 'unstarted',
      type: event.type || '',
      blockName: event.blockName || event.league?.name || 'Unknown',
      strategy: event.match?.strategy as Match['strategy'],
      teams: (event.match?.teams || event.teams) as Match['teams'],
      games: (event.match as { games?: Match['games'] })?.games
    };

    // Create an extended match object with additional properties
    const extendedMatch = { ...baseMatch } as Match & Record<string, unknown>;

    // Preserve additional data for enhanced display
    if (event.league) extendedMatch.league = event.league;
    if (event.streams) extendedMatch.streams = event.streams;
    if (event.tournament) extendedMatch.tournament = event.tournament;
    if (event.match?.flags) extendedMatch.match = { flags: event.match.flags };

    return extendedMatch;
  }

  async getCurrentLiveMatches() {
    try {
      const response = await this.getLive();
      let allEvents = (response.data?.schedule?.events || []) as RawEsportsEvent[];
      
      console.log('🔍 [ESPORTS API] Total events from getLive():', allEvents.length);
      
      // If getLive is empty, fallback to getSchedule and filter for inProgress
      if (allEvents.length === 0) {
        console.log('⚡ [ESPORTS API] getLive() empty, trying getSchedule() as fallback...');
        const scheduleResponse = await this.getSchedule([]);
        const scheduleEvents = (scheduleResponse.data?.schedule?.events || []) as RawEsportsEvent[];
        allEvents = scheduleEvents.filter((event: RawEsportsEvent) => event.state === 'inProgress');
        console.log('📅 [ESPORTS API] Found', allEvents.length, 'inProgress events from getSchedule()');
      }
      
      // Filter for events that are currently in progress (both matches and shows)
      const liveEvents = allEvents.filter((event: RawEsportsEvent) => 
        event.state === 'inProgress' && (event.type === 'match' || event.type === 'show')
      );
      
      console.log('🔴 [ESPORTS API] Live events (inProgress):', liveEvents.length);
      liveEvents.forEach((event, idx) => {
        console.log(`  ${idx + 1}. Type: ${event.type}, ID: ${event.id || event.match?.id}, State: ${event.state}`);
      });
      
      // For live matches, try to get detailed game information
      const enrichedEvents = await Promise.all(liveEvents.map(async (event: RawEsportsEvent) => {
        const transformed = this.transformEventToMatch(event);
        
        // If it's a live match, try to get game details
        const matchId = event.match?.id || event.id;
        if (event.type === 'match' && matchId) {
          try {
            console.log(`📊 [ESPORTS API] Fetching details for match event ${matchId}...`);
            const eventDetails = await this.getEventDetails(parseInt(matchId as string));
            const games = (eventDetails.data?.event?.match?.games || []) as { id?: string; state?: string; [key: string]: unknown }[];
            
            console.log(`  Found ${games.length} games for event ${matchId}`);
            games.forEach((game, idx) => {
              console.log(`    Game ${idx + 1}: ID=${game.id}, State=${game.state}`);
            });
            
            let liveGame = games.find((game) => game.state === 'inProgress');
            
            // If no game is marked as inProgress, try to find which game has live data
            // by checking the window API for each game
            if (!liveGame && games.length > 0) {
              console.log(`  🔍 No game marked inProgress, checking window API for each game...`);
              for (const game of games) {
                if (game.id) {
                  try {
                    const stats = await this.getLiveGameStats(game.id);
                    if (stats && stats.frames && stats.frames.length > 0) {
                      console.log(`  ✅ Found live data for game ${game.id}!`);
                      liveGame = game;
                      break;
                    }
                  } catch (err) {
                    // Game doesn't have live data, continue
                  }
                }
              }
            }
            
            if (liveGame && liveGame.id) {
              console.log(`  ✅ Using game ID: ${liveGame.id}, fetching stats...`);
              
              const [gameStats, gameDetails] = await Promise.all([
                this.getLiveGameStats(liveGame.id).catch(err => {
                  console.error(`  ❌ Failed to get game stats for game ${liveGame.id}:`, err.message);
                  return null;
                }),
                this.getLiveGameDetails(liveGame.id).catch(err => {
                  console.error(`  ⚠️ Failed to get game details for game ${liveGame.id}:`, err.message);
                  return null;
                })
              ]);
              
              if (gameStats) {
                console.log(`  ✅ Successfully fetched game stats for game ${liveGame.id}`);
                console.log('  Stats structure:', Object.keys(gameStats));
                if (gameStats.gameMetadata) {
                  console.log('    Has gameMetadata:', Object.keys(gameStats.gameMetadata));
                }
              }
              
              if (gameDetails) {
                console.log(`  ✅ Successfully fetched game details for game ${liveGame.id}`);
              }
              
              const extendedTransformed = transformed as Match & Record<string, unknown>;
              extendedTransformed.liveGameStats = gameStats;
              extendedTransformed.liveGameDetails = gameDetails;
              extendedTransformed.currentGame = liveGame;
              extendedTransformed.isCurrentGameLive = true; // We found live data
            } else {
              console.log(`  ⚠️ No live game found for event ${matchId}`);
            }
          } catch (error) {
            console.error(`❌ [ESPORTS API] Failed to get live game stats for event ${matchId}:`, error);
          }
        }
        
        return transformed;
      }));
      
      console.log(`🎮 [ESPORTS API] Returning ${enrichedEvents.length} enriched events`);
      return enrichedEvents;
    } catch (error) {
      console.error('❌ [ESPORTS API] Failed to fetch live matches:', error);
      return [];
    }
  }

  async getUpcomingSchedule(leagueNames: string[] = []) {
    try {
      // Get all schedule data (no league filtering at API level)
      const response = await this.getSchedule([]);
      const allEvents = (response.data?.schedule?.events || []) as RawEsportsEvent[];
      
      // Filter to only upcoming matches (unstarted)
      let upcomingMatches = allEvents.filter((event: RawEsportsEvent) => 
        event.state === 'unstarted' && event.type === 'match'
      );
      
      // Filter by league names if specified
      if (leagueNames.length > 0) {
        upcomingMatches = upcomingMatches.filter((event: RawEsportsEvent) => 
          leagueNames.includes(event.league?.name || '')
        );
      }
      
      return upcomingMatches.map((event: RawEsportsEvent) => this.transformEventToMatch(event));
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      return [];
    }
  }

  async getAvailableLeagues() {
    try {
      // Get all schedule data to extract unique leagues
      const response = await this.getSchedule([]);
      const allEvents = (response.data?.schedule?.events || []) as RawEsportsEvent[];
      
      // Extract unique leagues from matches
      const leagueMap = new Map<string, { name: string; slug: string; id: string }>();
      allEvents.forEach((event: RawEsportsEvent) => {
        if (event.type === 'match' && event.league?.name) {
          const league = event.league;
          const leagueName = league.name;
          if (leagueName && !leagueMap.has(leagueName)) {
            leagueMap.set(leagueName, {
              name: leagueName,
              slug: league.slug || '',
              // Generate a consistent ID based on name for compatibility
              id: leagueName.toLowerCase().replace(/[^a-z0-9]/g, '-')
            });
          }
        }
      });
      
      // Convert to array and sort by name
      return Array.from(leagueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
      return [];
    }
  }

  async getRecentResults(leagueIds: number[] = []) {
    try {
      const response = await this.getSchedule(leagueIds);
      const allEvents = (response.data?.schedule?.events || []) as RawEsportsEvent[];
      
      // Filter to only completed matches
      const completedMatches = allEvents.filter((event: RawEsportsEvent) => 
        event.state === 'completed' && event.type === 'match'
      );
      
      // Sort by start time (most recent first) and limit to 20
      const sortedMatches = completedMatches
        .sort((a: RawEsportsEvent, b: RawEsportsEvent) => {
          const aTime = new Date(a.startTime || 0).getTime();
          const bTime = new Date(b.startTime || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, 20);
      
      return sortedMatches.map((event: RawEsportsEvent) => this.transformEventToMatch(event));
    } catch (error) {
      console.error('Failed to fetch results:', error);
      return [];
    }
  }

  async getTournamentStandings(tournamentIds: number[]) {
    try {
      const response = await this.getStandings(tournamentIds);
      return response.data?.standings || [];
    } catch (error) {
      console.error('Failed to fetch standings:', error);
      return [];
    }
  }
}

// Export singleton instance
export const esportsApi = new EsportsAPI();

// Export types for TypeScript support
export interface League {
  id: number;
  name: string;
  slug: string;
  region: string;
  image: string;
  priority: number;
}

export interface Tournament {
  id: number;
  slug: string;
  startDate: string;
  endDate: string;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  code: string;
  image: string;
  alternativeImage: string;
  backgroundImage: string;
  status: string;
  players: Player[];
}

export interface Player {
  id: string;
  summonerName: string;
  firstName: string;
  lastName: string;
  image: string;
  role: string;
}

export interface Match {
  id: string;
  startTime: string;
  state: 'unstarted' | 'inProgress' | 'completed';
  type: string;
  blockName: string;
  strategy?: {
    type: string;
    count: number;
  };
  teams?: {
    id: string;
    name: string;
    slug: string;
    code: string;
    image: string;
    result?: {
      outcome: 'win' | 'loss';
      gameWins: number;
    };
    record?: {
      wins: number;
      losses: number;
    };
  }[];
  games?: {
    number: number;
    id: string;
    state: 'unstarted' | 'inProgress' | 'completed';
    teams: {
      id: string;
      side: 'blue' | 'red';
    }[];
    vods?: unknown[];
  }[];
}

export interface Standing {
  teamId: string;
  teamName: string;
  teamSlug: string;
  wins: number;
  losses: number;
  gameWins: number;
  gameLosses: number;
  rank: number;
}