import { FavoriteChampions } from '@/types/champion';

class FavoritesService {
  private readonly STORAGE_KEY = 'lol-favorites';

  /**
   * Get all favorite champions from localStorage
   */
  getFavorites(): FavoriteChampions {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return {};
    }
  }

  /**
   * Check if a champion is favorited
   */
  isFavorite(championId: string): boolean {
    const favorites = this.getFavorites();
    return favorites[championId] === true;
  }

  /**
   * Toggle favorite status for a champion
   */
  toggleFavorite(championId: string): boolean {
    const favorites = this.getFavorites();
    const newStatus = !favorites[championId];
    
    if (newStatus) {
      favorites[championId] = true;
    } else {
      delete favorites[championId];
    }

    this.saveFavorites(favorites);
    return newStatus;
  }

  /**
   * Add a champion to favorites
   */
  addFavorite(championId: string): void {
    const favorites = this.getFavorites();
    favorites[championId] = true;
    this.saveFavorites(favorites);
  }

  /**
   * Remove a champion from favorites
   */
  removeFavorite(championId: string): void {
    const favorites = this.getFavorites();
    delete favorites[championId];
    this.saveFavorites(favorites);
  }

  /**
   * Get array of favorite champion IDs
   */
  getFavoriteIds(): string[] {
    const favorites = this.getFavorites();
    return Object.keys(favorites).filter(id => favorites[id]);
  }

  /**
   * Get count of favorite champions
   */
  getFavoriteCount(): number {
    return this.getFavoriteIds().length;
  }

  /**
   * Clear all favorites
   */
  clearFavorites(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavorites(favorites: FavoriteChampions): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
}

export const favoritesService = new FavoritesService();