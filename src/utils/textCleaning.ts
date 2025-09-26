/**
 * Utility functions for cleaning and formatting text from Riot Games API
 */

/**
 * Comprehensive function to clean HTML tags and entities from Riot API text
 * Handles complex markup patterns found in League of Legends item descriptions,
 * champion abilities, and other game content.
 * 
 * @param text - The raw text from Riot API that may contain HTML markup
 * @returns Cleaned text suitable for display
 */
export function cleanRiotText(text: string): string {
  if (!text) return '';
  
  return text
    // Replace <br> tags with spaces for better readability
    .replace(/<br\s*\/?>/gi, ' ')
    
    // Remove all other HTML tags (including rarityLegendary, mainText, attention, stats, passive, etc.)
    .replace(/<[^>]*>/g, '')
    
    // Replace HTML entities
    .replace(/&nbsp;/g, ' ')    // Non-breaking space
    .replace(/&amp;/g, '&')     // Ampersand
    .replace(/&lt;/g, '<')      // Less than
    .replace(/&gt;/g, '>')      // Greater than
    .replace(/&quot;/g, '"')    // Quote
    .replace(/&#39;/g, "'")     // Apostrophe
    .replace(/&apos;/g, "'")    // Apostrophe (alternative)
    
    // Clean up template variables and Riot-specific markup
    .replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variable) => {
      // Handle common template variables by making them more readable
      if (variable.includes('basems') || variable.includes('movespeed')) return '[Movement Speed]';
      if (variable.includes('duration')) return '[Duration]';
      if (variable.includes('cooldown')) return '[Cooldown]';
      if (variable.includes('damage')) return '[Damage]';
      if (variable.includes('heal')) return '[Healing]';
      if (variable.includes('shield')) return '[Shield]';
      if (variable.includes('range')) return '[Range]';
      if (variable.includes('cost')) return '[Cost]';
      if (variable.includes('percent')) return '[%]';
      
      // For unknown variables, just return the variable name in brackets
      return `[${variable.split('.').pop() || variable}]`;
    })
    
    // Replace multiple consecutive whitespace with single space
    .replace(/\s+/g, ' ')
    
    // Trim leading and trailing whitespace
    .trim();
}

/**
 * Alternative shorter function name for backward compatibility
 */
export const cleanDescription = cleanRiotText;

/**
 * Clean item name specifically (may have different requirements)
 */
export function cleanItemName(name: string): string {
  return cleanRiotText(name);
}

/**
 * Clean champion ability text (handles ability-specific markup)
 */
export function cleanAbilityText(text: string): string {
  return cleanRiotText(text);
}

/**
 * Format gold amount with proper thousands separator
 */
export function formatGold(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}