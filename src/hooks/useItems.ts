import { useState, useEffect } from 'react';
import { Item, ItemsResponse } from '@/types/champion';
import { riotApi } from '@/lib/riot-api';

export interface ItemSummary {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gold: {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  };
  tags: string[];
  stats: Record<string, number>;
}

export function useItems() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const itemsResponse: ItemsResponse = await riotApi.getItems();
      
      // Convert the items object to an array and filter out non-purchasable items
      const itemsArray: ItemSummary[] = Object.entries(itemsResponse.data)
            .filter(([, item]: [string, Item]) => {
              // Filter condition if needed
              return item && item.gold;
            })
        .map(([id, item]: [string, Item]) => ({
          id,
          name: item.name,
          description: item.description,
          plaintext: item.plaintext,
          image: item.image,
          gold: item.gold,
          tags: item.tags,
          stats: item.stats,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
      
      setItems(itemsArray);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const refreshItems = async () => {
    await fetchItems();
  };

  return {
    items,
    loading,
    error,
    refreshItems,
  };
}