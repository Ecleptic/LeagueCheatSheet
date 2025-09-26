import React from 'react';
import { ItemSummary } from '@/hooks/useItems';
import ItemImage from './ui/ItemImage';

interface ItemCardProps {
  item: ItemSummary;
  onClick: (item: ItemSummary) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const handleClick = () => {
    onClick(item);
  };

  // Format gold cost
  const formatGold = (gold: number) => {
    return gold.toLocaleString();
  };

  // Get primary stats for display
  const getPrimaryStats = (stats: Record<string, number>) => {
    const primaryStats: string[] = [];
    
    if (stats.FlatHPPoolMod) primaryStats.push(`+${stats.FlatHPPoolMod} Health`);
    if (stats.FlatMPPoolMod) primaryStats.push(`+${stats.FlatMPPoolMod} Mana`);
    if (stats.FlatPhysicalDamageMod) primaryStats.push(`+${stats.FlatPhysicalDamageMod} Attack Damage`);
    if (stats.FlatMagicDamageMod) primaryStats.push(`+${stats.FlatMagicDamageMod} Ability Power`);
    if (stats.FlatArmorMod) primaryStats.push(`+${stats.FlatArmorMod} Armor`);
    if (stats.FlatSpellBlockMod) primaryStats.push(`+${stats.FlatSpellBlockMod} Magic Resist`);
    if (stats.PercentAttackSpeedMod) primaryStats.push(`+${(stats.PercentAttackSpeedMod * 100).toFixed(0)}% Attack Speed`);
    if (stats.FlatCritChanceMod) primaryStats.push(`+${(stats.FlatCritChanceMod * 100).toFixed(0)}% Critical Strike Chance`);
    if (stats.PercentLifeStealMod) primaryStats.push(`+${(stats.PercentLifeStealMod * 100).toFixed(0)}% Life Steal`);
    if (stats.FlatMovementSpeedMod) primaryStats.push(`+${stats.FlatMovementSpeedMod} Movement Speed`);
    
    return primaryStats.slice(0, 3); // Show up to 3 primary stats
  };

  const primaryStats = getPrimaryStats(item.stats);

  return (
    <button 
      onClick={handleClick}
      className="w-full text-left bg-riot-dark border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-riot-gold hover:bg-riot-dark/80 transition-all focus:outline-none focus:border-riot-blue"
    >
      <div className="flex items-center space-x-3">
        {/* Item Icon */}
        <div className="flex-shrink-0">
          <ItemImage
            itemImageFull={item.image.full}
            alt={item.name}
            className="w-12 h-12 rounded border border-gray-600"
          />
        </div>
        
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-riot-gold truncate">
                {item.name}
              </h3>
              <p className="text-xs text-gray-400 mb-1 line-clamp-2">
                {item.plaintext || 'No description available'}
              </p>
              
              {/* Stats */}
              {primaryStats.length > 0 && (
                <div className="text-xs text-gray-300 space-y-0.5">
                  {primaryStats.map((stat) => (
                    <div key={stat}>{stat}</div>
                  ))}
                </div>
              )}
              
              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Gold Cost */}
            <div className="flex-shrink-0 text-right ml-2">
              <div className="text-sm font-semibold text-yellow-400">
                {formatGold(item.gold.total)}
              </div>
              <div className="text-xs text-yellow-600">🪙</div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ItemCard;