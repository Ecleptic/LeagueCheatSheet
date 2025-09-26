#!/usr/bin/env node

/**
 * List all League of Legends champions with accurate positions
 * Data sourced from Community Dragon API + Riot Data Dragon API
 * 
 * This script uses the same API patterns as our web application
 * but as a standalone Node.js script for development/testing purposes.
 */

const RIOT_API_BASE = 'https://ddragon.leagueoflegends.com';
const COMMUNITY_DRAGON_API = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json';

/**
 * Community Dragon API Service (Node.js version)
 * Similar to src/lib/community-dragon-api.ts but for Node.js
 */
class CommunityDragonService {
  async getChampionPositions() {
    try {
      console.log('📡 Fetching champion positions from Community Dragon API...');
      const response = await fetch(COMMUNITY_DRAGON_API);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Community Dragon data: ${response.statusText}`);
      }
      
      const communityData = await response.json();
      
      // Filter valid champions and create position mapping
      const validChampions = communityData.filter(champ => 
        champ.id > 0 && champ.name !== 'None' && champ.alias && champ.alias !== 'None'
      );
      
      const positions = {};
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
      
      console.log(`✅ Loaded ${Object.keys(positions).length} champions with positions`);
      return positions;
    } catch (error) {
      console.error('❌ Error fetching position data:', error.message);
      return {};
    }
  }

  mapRolesToPositions(roles) {
    const roleToPositions = {
      'mage': ['Mid', 'Support'],
      'assassin': ['Mid', 'Jungle'], 
      'fighter': ['Top', 'Jungle'],
      'marksman': ['Bot'],
      'support': ['Support'],
      'tank': ['Top', 'Support', 'Jungle']
    };
    
    const positions = new Set();
    roles.forEach(role => {
      const mappedPositions = roleToPositions[role.toLowerCase()] || [];
      mappedPositions.forEach(pos => positions.add(pos));
    });
    
    return Array.from(positions);
  }
}

/**
 * Riot API Service (Node.js version)  
 * Similar to src/lib/riot-api.ts but for Node.js
 */
class RiotApiService {
  async getLatestVersion() {
    try {
      const response = await fetch(`${RIOT_API_BASE}/api/versions.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch API versions');
      }
      const versions = await response.json();
      return versions[0]; // Latest version
    } catch (error) {
      console.error('Error fetching version:', error);
      return '15.19.1'; // Fallback
    }
  }

  async getChampions() {
    const version = await this.getLatestVersion();
    console.log(`📦 Using API version: ${version}`);
    
    const response = await fetch(`${RIOT_API_BASE}/cdn/${version}/data/en_US/champion.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch champions');
    }
    
    const data = await response.json();
    return Object.values(data.data);
  }
}

// Initialize services
const communityDragonApi = new CommunityDragonService();
const riotApi = new RiotApiService();

async function getAllChampions() {
  try {
    console.log('🔍 Fetching League of Legends champions with positions...\n');
    
    // Fetch data using our API services
    const [championPositions, champions] = await Promise.all([
      communityDragonApi.getChampionPositions(),
      riotApi.getChampions()
    ]);
    
    // Sort alphabetically
    champions.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`\n🏆 Found ${champions.length} champions:\n`);
    
    // Display with position information
    displayChampionsWithPositions(champions, championPositions);
    displayPositionBreakdown(champions, championPositions);
    displayJsonWithPositions(champions, championPositions);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function displayChampionsWithPositions(champions, championPositions) {
  console.log('📍 CHAMPIONS WITH POSITIONS:');
  console.log('============================');
  
  champions.forEach((champ, index) => {
    const positionData = championPositions[champ.id] || { primary: 'Unknown', secondary: [] };
    const secondaryText = positionData.secondary.length > 0 
      ? ` (also: ${positionData.secondary.join(', ')})` 
      : '';
    
    console.log(`${index + 1}. ${champ.name} - ${positionData.primary}${secondaryText}`);
  });
  console.log();
}

function displayPositionBreakdown(champions, championPositions) {
  console.log('🎯 POSITION BREAKDOWN:');
  console.log('======================');
  
  const positionCounts = {
    'Top': { primary: 0, secondary: 0 },
    'Jungle': { primary: 0, secondary: 0 },
    'Mid': { primary: 0, secondary: 0 },
    'Bot': { primary: 0, secondary: 0 },
    'Support': { primary: 0, secondary: 0 },
    'Unknown': { primary: 0, secondary: 0 }
  };
  
  champions.forEach(champ => {
    const positionData = championPositions[champ.id] || { primary: 'Unknown', secondary: [] };
    
    positionCounts[positionData.primary].primary++;
    
    positionData.secondary.forEach(pos => {
      if (positionCounts[pos]) {
        positionCounts[pos].secondary++;
      }
    });
  });
  
  Object.entries(positionCounts).forEach(([position, counts]) => {
    const total = counts.primary + counts.secondary;
    if (total > 0) {
      console.log(`${position}: ${counts.primary} primary, ${counts.secondary} secondary (${total} total)`);
    }
  });
  console.log();
}

function displayJsonWithPositions(champions, championPositions) {
  console.log('📄 CHAMPIONS WITH POSITION DATA (JSON):');
  console.log('=======================================');
  
  const championsWithPositions = champions.map(champ => {
    const positionData = championPositions[champ.id] || { primary: 'Unknown', secondary: [] };
    return {
      id: champ.id,
      name: champ.name,
      title: champ.title,
      roles: champ.tags,
      primaryPosition: positionData.primary,
      secondaryPositions: positionData.secondary
    };
  });
  
  // Show first 3 examples
  console.log(JSON.stringify(championsWithPositions.slice(0, 3), null, 2));
  console.log('...');
  console.log(`\nTotal: ${championsWithPositions.length} champions with position data\n`);
}

function displaySimpleList(champions) {
  // Keep existing function for compatibility
  console.log('📝 SIMPLE LIST:');
  console.log('================');
  champions.forEach((champ, index) => {
    console.log(`${index + 1}. ${champ.name}`);
  });
  console.log();
}

function displayDetailedList(champions) {
  console.log('📋 DETAILED LIST:');
  console.log('==================');
  champions.forEach((champ, index) => {
    const roles = champ.tags ? champ.tags.join(', ') : 'Unknown';
    console.log(`${index + 1}. ${champ.name} - "${champ.title}" [${roles}]`);
  });
  console.log();
}

function displayByRole(champions) {
  console.log('🎭 BY ROLE:');
  console.log('============');
  
  const roleGroups = {};
  
  champions.forEach(champ => {
    const roles = champ.tags || ['Unknown'];
    roles.forEach(role => {
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

function displayJsonArray(champions) {
  console.log('📄 JSON ARRAY (for copy/paste):');
  console.log('================================');
  
  const championNames = champions.map(champ => champ.name);
  console.log(JSON.stringify(championNames, null, 2));
  console.log();
  
  console.log('📊 CHAMPION IDs ARRAY:');
  console.log('=======================');
  const championIds = champions.map(champ => champ.id);
  console.log(JSON.stringify(championIds, null, 2));
  console.log();
}

// Run the script
getAllChampions();