'use client';

import React, { useState, useMemo } from 'react';
import { useItems } from '@/hooks/useItems';
import { usePlayerActions } from '@/hooks/useTeamActions';
import ItemImage from '@/components/ui/ItemImage';
import { Item } from '@/types/champion';
import { ItemSummary } from '@/hooks/useItems';

interface ItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  team: 'blue' | 'red';
  playerId: string;
  playerName: string;
  itemSlotId: number;
  isBootsSlot?: boolean;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  isOpen,
  onClose,
  team,
  playerId,
  playerName,
  itemSlotId,
  isBootsSlot = false
}) => {
  const { items } = useItems();
  const playerActions = usePlayerActions(team, playerId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Convert ItemSummary to Item for team actions
  const convertToItem = (itemSummary: ItemSummary): Item => {
    return {
      name: itemSummary.name,
      description: itemSummary.description,
      colloq: '', // ItemSummary doesn't have this, so provide default
      plaintext: itemSummary.plaintext,
      into: undefined,
      image: itemSummary.image,
      gold: itemSummary.gold,
      tags: itemSummary.tags,
      maps: {}, // ItemSummary doesn't have this, so provide default
      stats: itemSummary.stats
    };
  };

  // Get categories from items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(items).forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => cats.add(tag));
      }
    });
    return Array.from(cats).sort();
  }, [items]);

  // Filter items based on search, category, and boots slot
  const filteredItems = useMemo(() => {
    return Object.values(items).filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || 
                             (item.tags && item.tags.includes(selectedCategory));
      
      // For boots slot, only show boots
      if (isBootsSlot) {
        const isBoots = item.tags?.includes('Boots') || 
                       item.name.toLowerCase().includes('boot');
        return matchesSearch && matchesCategory && isBoots;
      }
      
      // For regular slots, exclude boots
      const isBoots = item.tags?.includes('Boots') || 
                     item.name.toLowerCase().includes('boot');
      
      return matchesSearch && matchesCategory && !isBoots;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchTerm, selectedCategory, isBootsSlot]);

  // Popular items for different categories
  const popularItems = useMemo(() => {
    const popular: Record<string, string[]> = {
      'Damage': ['Long Sword', 'B. F. Sword', 'Pickaxe'],
      'Magic': ['Amplifying Tome', 'Needlessly Large Rod', 'Lost Chapter'],
      'Defense': ['Cloth Armor', 'Chain Vest', 'Negatron Cloak'],
      'Health': ['Ruby Crystal', 'Giant\'s Belt', 'Kindlegem'],
      'Boots': ['Boots', 'Berserker\'s Greaves', 'Sorcerer\'s Shoes', 'Plated Steelcaps']
    };
    
    const relevantCategory = isBootsSlot ? 'Boots' : (selectedCategory || 'Damage');
    const itemNames = popular[relevantCategory] || [];
    
    return itemNames.map((name: string) => 
      Object.values(items).find(item => 
        item.name.toLowerCase().includes(name.toLowerCase())
      )
    ).filter((item): item is ItemSummary => item !== undefined).slice(0, 4);
  }, [items, selectedCategory, isBootsSlot]);

  const handleItemSelect = (itemSummary: ItemSummary) => {
    const item = convertToItem(itemSummary);
    playerActions.addItem(item, itemSlotId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-riot-dark border border-gray-600 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Select {isBootsSlot ? 'Boots' : 'Item'} for {playerName} ({isBootsSlot ? 'Boots Slot' : `Slot ${itemSlotId + 1}`})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Search ${isBootsSlot ? 'boots' : 'items'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 bg-riot-gray border border-gray-500 rounded text-white placeholder-gray-400 focus:border-riot-blue focus:outline-none"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-riot-gray border border-gray-500 rounded text-white focus:border-riot-blue focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Popular Items */}
          {popularItems.length > 0 && (
            <section className="px-4 pt-4">
              <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">
                ⭐ Popular {isBootsSlot ? 'Boots' : 'Items'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {popularItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-riot-gray/50 rounded border border-gray-600 p-2 hover:bg-riot-gray/70 cursor-pointer transition-colors"
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ItemImage
                        itemImageFull={item.image.full}
                        alt={item.name}
                        className="w-12 h-12 rounded border border-gray-500"
                      />
                      <div className="text-xs font-medium text-white text-center line-clamp-2">
                        {item.name}
                      </div>
                      {item.gold && (
                        <div className="text-xs text-yellow-400">
                          {item.gold.total}g
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Items */}
          <section className="px-4 pb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              All {isBootsSlot ? 'Boots' : 'Items'} ({filteredItems.length})
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-riot-gray/50 rounded border border-gray-600 p-2 hover:bg-riot-gray/70 cursor-pointer transition-colors"
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ItemImage
                      itemImageFull={item.image.full}
                      alt={item.name}
                      className="w-12 h-12 rounded border border-gray-500"
                    />
                    <div className="text-xs font-medium text-white text-center line-clamp-2">
                      {item.name}
                    </div>
                    {item.gold && (
                      <div className="text-xs text-yellow-400">
                        {item.gold.total}g
                      </div>
                    )}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {item.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-1 py-0.5 bg-gray-600 text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No {isBootsSlot ? 'boots' : 'items'} found matching your criteria.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;