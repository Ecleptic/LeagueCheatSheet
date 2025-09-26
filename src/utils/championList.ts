/**
 * Champion List Utility
 * 
 * Simple utility to get and display all champions from your existing API
 * Can be imported and used anywhere in your project
 */

import { riotApi } from '@/lib/riot-api';
import { ChampionSummary } from '@/types/champion';

export interface ChampionListOptions {
  format?: 'simple' | 'detailed' | 'json' | 'roles';
  sortBy?: 'name' | 'id' | 'role';
  filter?: {
    role?: string;
    name?: string;
  };
}

export class ChampionListUtil {
  
  /**
   * Get all champions as a simple array
   */
  static async getChampionNames(): Promise<string[]> {
    try {
      const response = await riotApi.getChampions();
      const champions = Object.values(response.data);
      return champions
        .map(champ => champ.name)
        .sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error('Error fetching champion names:', error);
      return [];
    }
  }

  /**
   * Get all champions with full data
   */
  static async getAllChampions(): Promise<ChampionSummary[]> {
    try {
      const response = await riotApi.getChampions();
      const champions = Object.values(response.data);
      return champions.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching champions:', error);
      return [];
    }
  }

  /**
   * Display champions in console (useful for debugging/development)
   */
  static async displayChampions(options: ChampionListOptions = {}) {
    const { format = 'simple' } = options;
    
    try {
      const champions = await this.getAllChampions();
      
      console.log(`🏆 Found ${champions.length} champions:\n`);
      
      switch (format) {
        case 'simple':
          this.displaySimpleList(champions);
          break;
        case 'detailed':
          this.displayDetailedList(champions);
          break;
        case 'json':
          this.displayJsonFormat(champions);
          break;
        case 'roles':
          this.displayByRoles(champions);
          break;
        default:
          this.displaySimpleList(champions);
      }
      
      return champions;
    } catch (error) {
      console.error('Error displaying champions:', error);
      return [];
    }
  }

  /**
   * Get champions filtered by role
   */
  static async getChampionsByRole(role: string): Promise<ChampionSummary[]> {
    const champions = await this.getAllChampions();
    return champions.filter(champ => 
      champ.tags.some(tag => tag.toLowerCase().includes(role.toLowerCase()))
    );
  }

  /**
   * Search champions by name
   */
  static async searchChampions(query: string): Promise<ChampionSummary[]> {
    const champions = await this.getAllChampions();
    const lowerQuery = query.toLowerCase();
    return champions.filter(champ => 
      champ.name.toLowerCase().includes(lowerQuery) ||
      champ.title.toLowerCase().includes(lowerQuery)
    );
  }

  // Display methods
  private static displaySimpleList(champions: ChampionSummary[]) {
    console.log('📝 CHAMPION NAMES:');
    console.log('==================');
    champions.forEach((champ, index) => {
      console.log(`${index + 1}. ${champ.name}`);
    });
    console.log();
  }

  private static displayDetailedList(champions: ChampionSummary[]) {
    console.log('📋 DETAILED LIST:');
    console.log('==================');
    champions.forEach((champ, index) => {
      const roles = champ.tags.join(', ');
      console.log(`${index + 1}. ${champ.name} - "${champ.title}" [${roles}]`);
    });
    console.log();
  }

  private static displayJsonFormat(champions: ChampionSummary[]) {
    console.log('📄 JSON ARRAYS:');
    console.log('===============');
    
    console.log('\nChampion Names:');
    const names = champions.map(c => c.name);
    console.log(JSON.stringify(names, null, 2));
    
    console.log('\nChampion IDs:');
    const ids = champions.map(c => c.id);
    console.log(JSON.stringify(ids, null, 2));
    
    console.log('\nFull Data (first 3):');
    console.log(JSON.stringify(champions.slice(0, 3), null, 2));
  }

  private static displayByRoles(champions: ChampionSummary[]) {
    console.log('🎭 CHAMPIONS BY ROLE:');
    console.log('=====================');
    
    const roleGroups: Record<string, string[]> = {};
    
    champions.forEach(champ => {
      champ.tags.forEach(role => {
        if (!roleGroups[role]) {
          roleGroups[role] = [];
        }
        roleGroups[role].push(champ.name);
      });
    });
    
    Object.keys(roleGroups).sort().forEach(role => {
      console.log(`\n${role.toUpperCase()}:`);
      roleGroups[role].sort().forEach(name => {
        console.log(`  • ${name}`);
      });
    });
    console.log();
  }
}

// Convenience functions for quick use
export const getChampionNames = ChampionListUtil.getChampionNames;
export const getAllChampions = ChampionListUtil.getAllChampions;
export const displayChampions = ChampionListUtil.displayChampions;
export const searchChampions = ChampionListUtil.searchChampions;

export default ChampionListUtil;