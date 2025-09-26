import { ChampionPosition } from '@/types/champion';

const COMMUNITY_DRAGON_API = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface CommunityDragonChampion {
  id: number;
  name: string;
  description: string;
  alias: string;
  contentId: string;
  squarePortraitPath: string;
  roles: string[];
}

class CommunityDragonService {
  /**
   * Fetch champion position data from Community Dragon API
   */
  async getChampionPositions(): Promise<Record<string, ChampionPosition>> {
    const cacheKey = 'community-dragon-positions';
    const now = Date.now();

    // Check localStorage cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (now - parsedData.timestamp < CACHE_DURATION) {
          return parsedData.data;
        }
      } catch (err) {
        console.warn('Failed to parse cached Community Dragon data:', err);
      }
    }

    try {
      const response = await fetch(COMMUNITY_DRAGON_API);
      if (!response.ok) {
        throw new Error(`Failed to fetch Community Dragon data: ${response.statusText}`);
      }

      const communityData: CommunityDragonChampion[] = await response.json();
      
      // Filter valid champions and create position mapping
      const validChampions = communityData.filter(champ => 
        champ.id > 0 && champ.name !== 'None' && champ.alias && champ.alias !== 'None'
      );

      const positions: Record<string, ChampionPosition> = {};
      validChampions.forEach(champ => {
        if (champ.roles && champ.roles.length > 0) {
          const mappedPositions = this.mapRolesToPositions(champ.roles);
          if (mappedPositions.length > 0) {
            positions[champ.alias] = {
              primary: mappedPositions[0],
              secondary: mappedPositions.slice(1)
            };
          }
        }
      });

      // Cache the processed data
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: positions,
          timestamp: now
        }));
      } catch (err) {
        console.warn('Failed to cache Community Dragon positions data:', err);
      }

      return positions;
    } catch (error) {
      console.error('Error fetching Community Dragon data:', error);
      return {};
    }
  }

  /**
   * Map Community Dragon roles to game positions
   */
  private mapRolesToPositions(roles: string[]): ('Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support')[] {
    const roleToPositions = {
      'mage': ['Mid', 'Support'],
      'assassin': ['Mid', 'Jungle'], 
      'fighter': ['Top', 'Jungle'],
      'marksman': ['Bot'],
      'support': ['Support'],
      'tank': ['Top', 'Support', 'Jungle']
    } as const;

    const positions = new Set<'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support'>();
    roles.forEach(role => {
      const mappedPositions = roleToPositions[role.toLowerCase() as keyof typeof roleToPositions] || [];
      mappedPositions.forEach(pos => positions.add(pos));
    });

    return Array.from(positions);
  }

  /**
   * Get position info for a specific champion
   */
  async getChampionPosition(championId: string): Promise<ChampionPosition | undefined> {
    const positions = await this.getChampionPositions();
    return positions[championId];
  }

  /**
   * Get all champions that can play a specific position
   */
  async getChampionsByPosition(position: 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support'): Promise<string[]> {
    const positions = await this.getChampionPositions();
    return Object.entries(positions)
      .filter(([, championPosition]) => 
        championPosition.primary === position || championPosition.secondary?.includes(position)
      )
      .map(([championId]) => championId);
  }

  /**
   * Clear cached Community Dragon data
   */
  clearCache(): void {
    localStorage.removeItem('community-dragon-positions');
  }
}

export const communityDragonApi = new CommunityDragonService();