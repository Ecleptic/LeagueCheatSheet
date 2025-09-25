import { useState, useEffect } from 'react';
import { favoritesService } from '@/lib/favorites';

interface UseFavoritesReturn {
  favorites: Set<string>;
  isFavorite: (championId: string) => boolean;
  toggleFavorite: (championId: string) => void;
  favoriteCount: number;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load favorites from localStorage on mount
    const favoriteIds = favoritesService.getFavoriteIds();
    setFavorites(new Set(favoriteIds));
  }, []);

  const isFavorite = (championId: string): boolean => {
    return favorites.has(championId);
  };

  const toggleFavorite = (championId: string): void => {
    const newStatus = favoritesService.toggleFavorite(championId);
    
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newStatus) {
        newSet.add(championId);
      } else {
        newSet.delete(championId);
      }
      return newSet;
    });
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoriteCount: favorites.size,
  };
}