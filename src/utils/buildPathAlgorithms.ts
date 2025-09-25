import { Item, ChampionSummary } from '../types/champion';
import { BuildPath, BuildRecommendation, ItemEfficiency, BuildAnalysis } from '../types/build';
import { GamePhase } from '../types/team';

// Gold values for stats (approximate values based on basic items)
const STAT_GOLD_VALUES: Record<string, number> = {
  // Damage stats
  FlatPhysicalDamageMod: 35, // AD
  FlatMagicDamageMod: 21.75, // AP
  FlatCritChanceMod: 4000, // Crit chance (per 100%)
  PercentAttackSpeedMod: 2500, // Attack speed (per 100%)
  
  // Defensive stats
  FlatHPPoolMod: 2.67, // Health
  FlatArmorMod: 20, // Armor
  FlatSpellBlockMod: 18, // Magic Resist
  
  // Utility stats
  FlatMovementSpeedMod: 39, // Movement Speed
  PercentMovementSpeedMod: 3900, // Movement Speed (per 100%)
  FlatMPPoolMod: 1.4, // Mana
  
  // Regen stats
  PercentLifeStealMod: 5500, // Lifesteal (per 100%)
  FlatHPRegenMod: 50, // Health regen
  FlatMPRegenMod: 50, // Mana regen
};

/**
 * Calculate the gold efficiency of an item based on its stats
 */
export const calculateItemEfficiency = (item: Item): ItemEfficiency => {
  let totalStatValue = 0;
  const effectiveStats: Record<string, number> = {};

  // Calculate gold value of all stats
  Object.entries(item.stats).forEach(([statName, statValue]) => {
    const goldPerStat = STAT_GOLD_VALUES[statName];
    if (goldPerStat && statValue > 0) {
      const statGoldValue = statValue * goldPerStat;
      totalStatValue += statGoldValue;
      effectiveStats[statName] = statValue;
    }
  });

  const efficiency = item.gold.total > 0 ? (totalStatValue / item.gold.total) * 100 : 0;

  return {
    item,
    goldValue: totalStatValue,
    efficiency: Math.round(efficiency * 100) / 100,
    effectiveStats
  };
};

/**
 * Find all items that build into a target item
 */
export const findBuildComponents = (targetItemId: string, allItems: Record<string, Item>): Item[] => {
  const components: Item[] = [];
  
  Object.values(allItems).forEach(item => {
    if (item.into?.includes(targetItemId)) {
      components.push(item);
    }
  });

  return components;
};

/**
 * Find all items that a given item can build into
 */
export const findBuildOptions = (itemId: string, allItems: Record<string, Item>): Item[] => {
  const item = allItems[itemId];
  if (!item?.into) return [];

  return item.into
    .map(id => allItems[id])
    .filter(Boolean);
};

/**
 * Calculate the most cost-efficient build path to a target item
 */
export const findOptimalBuildPath = (
  currentItems: Item[], 
  targetItem: Item, 
  availableGold: number,
  allItems: Record<string, Item>
): BuildPath | null => {
  // Find what components are needed
  const components = findBuildComponents(targetItem.name, allItems);
  if (components.length === 0) {
    // This is a basic item
    const canAfford = availableGold >= targetItem.gold.total;
    return {
      item: targetItem,
      components: [],
      totalCost: targetItem.gold.total,
      stepCost: targetItem.gold.total,
      priority: canAfford ? 8 : 5,
      canAfford
    };
  }

  // Check which components we already have
  const currentItemNames = currentItems.map(item => item.name);
  const neededComponents = components.filter(comp => !currentItemNames.includes(comp.name));
  
  // If we have all components, just need the combine cost
  if (neededComponents.length === 0) {
    const combineGold = targetItem.gold.base;
    const canAfford = availableGold >= combineGold;
    return {
      item: targetItem,
      components: components,
      totalCost: combineGold,
      stepCost: combineGold,
      priority: canAfford ? 10 : 7,
      canAfford
    };
  }

  // Calculate total cost of needed components
  const totalComponentCost = neededComponents.reduce((sum, comp) => sum + comp.gold.total, 0);
  const totalCost = totalComponentCost + targetItem.gold.base;
  
  // Find the cheapest next component to buy
  const cheapestComponent = neededComponents.reduce((cheapest, comp) => 
    comp.gold.total < cheapest.gold.total ? comp : cheapest
  );

  const canAfford = availableGold >= cheapestComponent.gold.total;

  return {
    item: targetItem,
    components: components,
    totalCost,
    stepCost: cheapestComponent.gold.total,
    priority: canAfford ? 6 : 3,
    canAfford
  };
};

/**
 * Get item recommendations based on champion, current items, and game phase
 */
export const getItemRecommendations = (
  champion: ChampionSummary,
  currentItems: Item[],
  gamePhase: GamePhase,
  availableGold: number,
  allItems: Record<string, Item>
): BuildRecommendation[] => {
  const recommendations: BuildRecommendation[] = [];
  
  // Determine champion's primary role and damage type
  const isAD = champion.tags.includes('Marksman') || champion.tags.includes('Fighter');
  const isAP = champion.tags.includes('Mage') || champion.tags.includes('Assassin');
  const isTank = champion.tags.includes('Tank');
  const isSupport = champion.tags.includes('Support');

  // Get items suitable for this champion type and game phase
  const suitableItems = Object.values(allItems).filter(item => {
    // Filter out consumables, trinkets, etc.
    if (!item.gold.purchasable || item.gold.total === 0) return false;
    
    // Filter by item tags based on champion type
    if (isAD && (item.tags.includes('Damage') || item.tags.includes('CriticalStrike') || item.tags.includes('AttackSpeed'))) {
      return true;
    }
    if (isAP && item.tags.includes('SpellDamage')) {
      return true;
    }
    if (isTank && (item.tags.includes('Health') || item.tags.includes('Armor') || item.tags.includes('SpellBlock'))) {
      return true;
    }
    if (isSupport && (item.tags.includes('ManaRegen') || item.tags.includes('CooldownReduction'))) {
      return true;
    }
    
    // Include boots for everyone
    if (item.tags.includes('Boots')) {
      return true;
    }

    return false;
  });

  // Create build recommendations
  suitableItems.slice(0, 10).forEach(item => {
    const buildPath = findOptimalBuildPath(currentItems, item, availableGold, allItems);
    if (buildPath) {
      const efficiency = calculateItemEfficiency(item);
      
      let reasoning = `Good ${gamePhase} game item for ${champion.name}`;
      if (efficiency.efficiency > 100) {
        reasoning += ` (${efficiency.efficiency}% gold efficient)`;
      }

      recommendations.push({
        nextItem: item,
        alternatives: [], // TODO: Implement alternatives logic
        reasoning,
        costEfficiency: efficiency.efficiency,
        buildPath
      });
    }
  });

  // Sort by priority (affordability and efficiency)
  return recommendations
    .sort((a, b) => {
      if (a.buildPath.canAfford && !b.buildPath.canAfford) return -1;
      if (!a.buildPath.canAfford && b.buildPath.canAfford) return 1;
      return b.buildPath.priority - a.buildPath.priority;
    })
    .slice(0, 6); // Return top 6 recommendations
};

/**
 * Analyze a player's current build and provide comprehensive recommendations
 */
export const analyzeBuild = (
  champion: ChampionSummary,
  currentItems: Item[],
  gamePhase: GamePhase,
  availableGold: number,
  allItems: Record<string, Item>
): BuildAnalysis => {
  const recommendations = getItemRecommendations(champion, currentItems, gamePhase, availableGold, allItems);
  
  // Find potential power spike items
  const powerSpikeItems = recommendations
    .filter(rec => rec.buildPath.priority >= 8)
    .map(rec => rec.nextItem);

  // Find situational items (defensive options)
  const situationalItems = Object.values(allItems)
    .filter(item => 
      item.tags.includes('Armor') || 
      item.tags.includes('SpellBlock') || 
      item.tags.includes('Health')
    )
    .slice(0, 5);

  return {
    champion,
    currentItems,
    gamePhase,
    availableGold,
    recommendations,
    powerSpikes: powerSpikeItems,
    situationalItems
  };
};

/**
 * Cache for build calculations to improve performance
 */
const buildCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedBuildAnalysis = (
  champion: ChampionSummary,
  currentItems: Item[],
  gamePhase: GamePhase,
  availableGold: number,
  allItems: Record<string, Item>
): BuildAnalysis => {
  const cacheKey = `${champion.id}-${currentItems.map(i => i.name).join(',')}-${gamePhase}-${availableGold}`;
  const cached = buildCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const analysis = analyzeBuild(champion, currentItems, gamePhase, availableGold, allItems);
  buildCache.set(cacheKey, {
    data: analysis,
    timestamp: Date.now()
  });

  return analysis;
};

/**
 * Clear the build cache (useful when item data updates)
 */
export const clearBuildCache = () => {
  buildCache.clear();
};