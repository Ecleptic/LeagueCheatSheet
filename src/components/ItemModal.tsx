import React from 'react';
import { ItemSummary } from '@/hooks/useItems';
import ItemImage from './ItemImage';

interface ItemModalProps {
  item: ItemSummary;
  isOpen: boolean;
  onClose: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format gold cost
  const formatGold = (gold: number) => {
    return gold.toLocaleString();
  };

  // Get all stats for detailed view
  const getDetailedStats = (stats: Record<string, number>) => {
    const statMappings: Record<string, string> = {
      FlatHPPoolMod: 'Health',
      FlatMPPoolMod: 'Mana',
      FlatPhysicalDamageMod: 'Attack Damage',
      FlatMagicDamageMod: 'Ability Power',
      FlatArmorMod: 'Armor',
      FlatSpellBlockMod: 'Magic Resist',
      FlatMovementSpeedMod: 'Movement Speed',
      FlatEnergyPoolMod: 'Energy',
      FlatEXPBonus: 'Experience Bonus',
      FlatHPRegenMod: 'Health Regen',
      FlatMPRegenMod: 'Mana Regen',
    };
    
    const percentageStats: Record<string, string> = {
      PercentAttackSpeedMod: 'Attack Speed',
      FlatCritChanceMod: 'Critical Strike Chance',
      PercentLifeStealMod: 'Life Steal',
      PercentSpellVampMod: 'Spell Vamp',
    };
    
    const formattedStats: { label: string; value: string }[] = [];
    
    // Add flat stats
    Object.entries(statMappings).forEach(([key, label]) => {
      if (stats[key]) {
        formattedStats.push({ label, value: `+${stats[key]}` });
      }
    });
    
    // Add percentage stats
    Object.entries(percentageStats).forEach(([key, label]) => {
      if (stats[key]) {
        formattedStats.push({ 
          label, 
          value: `+${(stats[key] * 100).toFixed(0)}%` 
        });
      }
    });
    
    // Special case for cooldown reduction (negative value)
    if (stats.PercentCooldownMod) {
      formattedStats.push({ 
        label: 'Cooldown Reduction', 
        value: `+${Math.abs(stats.PercentCooldownMod * 100).toFixed(0)}%` 
      });
    }
    
    return formattedStats;
  };

  const detailedStats = getDetailedStats(item.stats);

  // Clean up the description HTML
  const cleanDescription = (description: string) => {
    return description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .trim();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-riot-gray rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-riot-dark to-riot-gray p-6 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
          
          <div className="flex items-center space-x-4">
            <ItemImage
              itemImageFull={item.image.full}
              alt={item.name}
              className="w-16 h-16 rounded border-2 border-riot-gold"
            />
            <div>
              <h1 className="text-2xl font-bold text-riot-gold">{item.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-lg font-semibold text-yellow-400">
                  🪙 {formatGold(item.gold.total)}
                </div>
                {item.gold.base > 0 && (
                  <div className="text-sm text-gray-400">
                    (Base: {formatGold(item.gold.base)})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plain Text Description */}
          {item.plaintext && (
            <div>
              <h3 className="text-lg font-semibold text-riot-gold mb-2">Summary</h3>
              <p className="text-gray-300">{item.plaintext}</p>
            </div>
          )}

          {/* Detailed Description */}
          {item.description && (
            <div>
              <h3 className="text-lg font-semibold text-riot-gold mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{cleanDescription(item.description)}</p>
            </div>
          )}

          {/* Stats */}
          {detailedStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-riot-gold mb-2">Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {detailedStats.map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center bg-riot-dark p-2 rounded">
                    <span className="text-gray-300">{stat.label}</span>
                    <span className="text-riot-gold font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-riot-gold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-riot-blue text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gold Information */}
          <div>
            <h3 className="text-lg font-semibold text-riot-gold mb-2">Gold Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-riot-dark p-3 rounded">
                <div className="text-sm text-gray-400">Total Cost</div>
                <div className="text-lg font-semibold text-yellow-400">🪙 {formatGold(item.gold.total)}</div>
              </div>
              <div className="bg-riot-dark p-3 rounded">
                <div className="text-sm text-gray-400">Sell Value</div>
                <div className="text-lg font-semibold text-yellow-400">🪙 {formatGold(item.gold.sell)}</div>
              </div>
              {item.gold.base > 0 && (
                <>
                  <div className="bg-riot-dark p-3 rounded">
                    <div className="text-sm text-gray-400">Base Cost</div>
                    <div className="text-lg font-semibold text-yellow-400">🪙 {formatGold(item.gold.base)}</div>
                  </div>
                  <div className="bg-riot-dark p-3 rounded">
                    <div className="text-sm text-gray-400">Recipe Cost</div>
                    <div className="text-lg font-semibold text-yellow-400">🪙 {formatGold(item.gold.total - item.gold.base)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;