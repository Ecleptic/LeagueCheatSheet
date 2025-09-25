// LoL Esports API Integration
// Documentation: https://vickz84259.github.io/lolesports-api-docs/

const ESPORTS_API_BASE = 'https://esports-api.lolesports.com/persisted/gw';
const MATCH_DETAILS_BASE = 'https://feed.lolesports.com/livestats/v1';
const HIGHLANDER_BASE = 'https://api.lolesports.com/api/v1';
const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

interface EsportsAPIOptions {
  locale?: string;
}

class EsportsAPI {
  private async request(url: string, params: Record<string, any> = {}) {
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
  async getLiveGameStats(gameId: number, startingTime?: string) {
    const params: Record<string, any> = {};
    if (startingTime) {
      params.startingTime = startingTime;
    }
    
    const searchParams = new URLSearchParams(params);
    const url = `${MATCH_DETAILS_BASE}/window/${gameId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Live game stats request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async getLiveGameDetails(gameId: number, startingTime?: string, participantIds?: string) {
    const params: Record<string, any> = {};
    if (startingTime) params.startingTime = startingTime;
    if (participantIds) params.participantIds = participantIds;
    
    const searchParams = new URLSearchParams(params);
    const url = `${MATCH_DETAILS_BASE}/details/${gameId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Live game details request failed: ${response.status}`);
    }
    
    return response.json();
  }

  async getMatchWindow(gameId: number, startingTime?: string) {
    const params: Record<string, any> = {};
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
    const params: Record<string, any> = {};
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
  private transformEventToMatch(event: any): Match {
    const transformed: any = {
      id: event.id || `${event.type}-${event.startTime}`,
      startTime: event.startTime,
      state: event.state as 'unstarted' | 'inProgress' | 'completed',
      type: event.type,
      blockName: event.blockName || event.league?.name || 'Unknown',
      strategy: event.match?.strategy,
      teams: event.match?.teams || event.teams || undefined
    };

    // Preserve additional data for enhanced display
    if (event.league) transformed.league = event.league;
    if (event.streams) transformed.streams = event.streams;
    if (event.tournament) transformed.tournament = event.tournament;
    if (event.match?.flags) transformed.match = { flags: event.match.flags };

    return transformed as Match;
  }

  async getCurrentLiveMatches() {
    try {
      const response = await this.getLive();
      const allEvents = response.data?.schedule?.events || [];
      
      // Filter for events that are currently in progress (both matches and shows)
      const liveEvents = allEvents.filter((event: any) => 
        event.state === 'inProgress' && (event.type === 'match' || event.type === 'show')
      );
      
      // For live matches, try to get detailed game information
      const enrichedEvents = await Promise.all(liveEvents.map(async (event: any) => {
        const transformed = this.transformEventToMatch(event);
        
        // If it's a live match, try to get game details
        if (event.type === 'match' && event.id) {
          try {
            const eventDetails = await this.getEventDetails(parseInt(event.id));
            const games = eventDetails.data?.event?.match?.games || [];
            const liveGame = games.find((game: any) => game.state === 'inProgress');
            
            if (liveGame) {
              const [gameStats, gameDetails] = await Promise.all([
                this.getLiveGameStats(parseInt(liveGame.id)),
                this.getLiveGameDetails(parseInt(liveGame.id)).catch(() => null)
              ]);
              
              (transformed as any).liveGameStats = gameStats;
              (transformed as any).liveGameDetails = gameDetails;
              (transformed as any).currentGame = liveGame;
            }
          } catch (error) {
            console.warn(`Failed to get live game stats for event ${event.id}:`, error);
          }
        }
        
        return transformed;
      }));
      
      return enrichedEvents;
    } catch (error) {
      console.error('Failed to fetch live matches:', error);
      return [];
    }
  }

  async getUpcomingSchedule(leagueNames: string[] = []) {
    try {
      // Get all schedule data (no league filtering at API level)
      const response = await this.getSchedule([]);
      const allEvents = response.data?.schedule?.events || [];
      
      // Filter to only upcoming matches (unstarted)
      let upcomingMatches = allEvents.filter((event: any) => 
        event.state === 'unstarted' && event.type === 'match'
      );
      
      // Filter by league names if specified
      if (leagueNames.length > 0) {
        upcomingMatches = upcomingMatches.filter((event: any) => 
          leagueNames.includes(event.league?.name)
        );
      }
      
      return upcomingMatches.map((event: any) => this.transformEventToMatch(event));
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      return [];
    }
  }

  async getAvailableLeagues() {
    try {
      // Get all schedule data to extract unique leagues
      const response = await this.getSchedule([]);
      const allEvents = response.data?.schedule?.events || [];
      
      // Extract unique leagues from matches
      const leagueMap = new Map();
      allEvents.forEach((event: any) => {
        if (event.type === 'match' && event.league) {
          const league = event.league;
          if (!leagueMap.has(league.name)) {
            leagueMap.set(league.name, {
              name: league.name,
              slug: league.slug,
              // Generate a consistent ID based on name for compatibility
              id: league.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
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
      const allEvents = response.data?.schedule?.events || [];
      
      // Filter to only completed matches
      const completedMatches = allEvents.filter((event: any) => 
        event.state === 'completed' && event.type === 'match'
      );
      
      // Sort by start time (most recent first) and limit to 20
      const sortedMatches = completedMatches
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 20);
      
      return sortedMatches.map((event: any) => this.transformEventToMatch(event));
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