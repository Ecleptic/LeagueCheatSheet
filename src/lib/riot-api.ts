import { ApiVersion, ChampionsResponse, ChampionResponse, ItemsResponse } from '@/types/champion';
import { SummonerSpellsResponse } from '@/types/summonerSpell';

const RIOT_API_BASE = 'https://ddragon.leagueoflegends.com';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class RiotApiService {
  private version: string | null = null;
  private versionCacheTime: number | null = null;

  /**
   * Get the latest API version, with caching
   */
  async getLatestVersion(): Promise<string> {
    const now = Date.now();
    
    // Check if we have a cached version that's still fresh
    if (this.version && this.versionCacheTime && (now - this.versionCacheTime < CACHE_DURATION)) {
      return this.version;
    }

    try {
      // Try to get cached version from localStorage first
      const cachedVersionData = localStorage.getItem('riot-api-version');
      if (cachedVersionData) {
        const parsedData: ApiVersion = JSON.parse(cachedVersionData);
        if (now - parsedData.timestamp < CACHE_DURATION) {
          this.version = parsedData.version;
          this.versionCacheTime = now;
          return this.version;
        }
      }

      // Fetch fresh version data
      const response = await fetch(`${RIOT_API_BASE}/api/versions.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch API versions');
      }
      
      const versions: string[] = await response.json();
      this.version = versions[0]; // Get the latest version
      this.versionCacheTime = now;

      // Cache the version in localStorage
      const versionData: ApiVersion = {
        version: this.version,
        cached: true,
        timestamp: now,
      };
      localStorage.setItem('riot-api-version', JSON.stringify(versionData));

      return this.version;
    } catch (error) {
      console.error('Error fetching API version:', error);
      // Fallback to a more recent version if API fails
      return '15.19.1';
    }
  }

  /**
   * Get all champions list
   */
  async getChampions(): Promise<ChampionsResponse> {
    const version = await this.getLatestVersion();
    const cacheKey = `champions-${version}`;
    
    // Check localStorage cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        console.warn('Failed to parse cached champions data');
      }
    }

    try {
      const response = await fetch(`${RIOT_API_BASE}/cdn/${version}/data/en_US/champion.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch champions');
      }
      
      const data: ChampionsResponse = await response.json();
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error fetching champions:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific champion
   */
  async getChampionDetail(championId: string): Promise<ChampionResponse> {
    const version = await this.getLatestVersion();
    const cacheKey = `champion-${championId}-${version}`;
    
    // Check localStorage cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        console.warn(`Failed to parse cached data for champion ${championId}`);
      }
    }

    try {
      const response = await fetch(`${RIOT_API_BASE}/cdn/${version}/data/en_US/champion/${championId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch champion ${championId}`);
      }
      
      const data: ChampionResponse = await response.json();
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error(`Error fetching champion ${championId}:`, error);
      throw error;
    }
  }

  /**
   * Get all items
   */
  async getItems(): Promise<ItemsResponse> {
    const version = await this.getLatestVersion();
    const cacheKey = `items-${version}`;
    
    // Check localStorage cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        console.warn('Failed to parse cached items data');
      }
    }

    try {
      const response = await fetch(`${RIOT_API_BASE}/cdn/${version}/data/en_US/item.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data: ItemsResponse = await response.json();
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Get champion portrait image URL
   */
  async getChampionImageUrl(championImageName: string): Promise<string> {
    const version = await this.getLatestVersion();
    return `${RIOT_API_BASE}/cdn/${version}/img/champion/${championImageName}`;
  }

  /**
   * Get champion splash art URL
   */
  getChampionSplashUrl(championId: string, skinNum: number = 0): string {
    return `${RIOT_API_BASE}/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
  }

  /**
   * Get champion loading screen URL
   */
  getChampionLoadingUrl(championId: string, skinNum: number = 0): string {
    return `${RIOT_API_BASE}/cdn/img/champion/loading/${championId}_${skinNum}.jpg`;
  }

  /**
   * Get ability icon URL
   */
  async getAbilityImageUrl(abilityImageName: string): Promise<string> {
    const version = await this.getLatestVersion();
    return `${RIOT_API_BASE}/cdn/${version}/img/spell/${abilityImageName}`;
  }

  /**
   * Get passive ability icon URL
   */
  async getPassiveImageUrl(passiveImageName: string): Promise<string> {
    const version = await this.getLatestVersion();
    return `${RIOT_API_BASE}/cdn/${version}/img/passive/${passiveImageName}`;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('champions-') || key.startsWith('champion-') || 
          key.startsWith('items-') || key.startsWith('summoner-spells-') || 
          key === 'riot-api-version') {
        localStorage.removeItem(key);
      }
    });
    this.version = null;
    this.versionCacheTime = null;
  }

  /**
   * Fetch summoner spells data
   */
  async getSummonerSpells(): Promise<SummonerSpellsResponse> {
    const version = await this.getLatestVersion();
    const cacheKey = `summoner-spells-${version}`;
    const now = Date.now();

    // Try to get cached data first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (now - parsedData.timestamp < CACHE_DURATION) {
          return parsedData.data;
        }
      } catch (error) {
        console.warn('Failed to parse cached summoner spells data');
      }
    }

    // Fetch fresh data
    const response = await fetch(`${RIOT_API_BASE}/cdn/${version}/data/en_US/summoner.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch summoner spells: ${response.statusText}`);
    }

    const summonerSpells: SummonerSpellsResponse = await response.json();

    // Cache the data
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: summonerSpells,
        timestamp: now
      }));
    } catch (error) {
      console.warn('Failed to cache summoner spells data');
    }

    return summonerSpells;
  }

  /**
   * Get summoner spell icon URL
   */
  async getSummonerSpellImageUrl(spellImageName: string): Promise<string> {
    const version = await this.getLatestVersion();
    return `${RIOT_API_BASE}/cdn/${version}/img/spell/${spellImageName}`;
  }

  /**
   * Get item icon URL
   */
  async getItemImageUrl(itemImageName: string): Promise<string> {
    const version = await this.getLatestVersion();
    return `${RIOT_API_BASE}/cdn/${version}/img/item/${itemImageName}`;
  }
}

export const riotApi = new RiotApiService();