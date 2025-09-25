/**
 * Esports Configuration
 * Static URLs and configuration values for esports components
 */

export const LEAGUE_ICONS: { [key: string]: string } = {
  'lck': 'https://static.lolesports.com/leagues/1592591612171_LCK_0.png',
  'lec': 'https://static.lolesports.com/leagues/1592591662224_LEC.png',
  'lpl': 'https://static.lolesports.com/leagues/1592591481168_LPL.png',
  'lcs': 'https://static.lolesports.com/leagues/1592591644092_LCS.png',
  'ljl': 'https://static.lolesports.com/leagues/1592591658947_LJL.png',
  'pcs': 'https://static.lolesports.com/leagues/1592591671984_PCS.png',
  'cblol': 'https://static.lolesports.com/leagues/1592591600688_CBLOL.png',
  'lla': 'https://static.lolesports.com/leagues/1592591656542_LLA.png',
  'emea masters': 'https://static.lolesports.com/leagues/1669375535108_EM_Icon_Green1.png',
  'lck challengers': 'https://static.lolesports.com/leagues/1643211040152_LCKC.png',
  'worlds': 'https://static.lolesports.com/leagues/1631819135435_worlds-2021-logo-worlds-white.png',
  'msi': 'https://static.lolesports.com/leagues/Mid-Season_Invitational.png'
};

/**
 * Get league icon URL by league name with fallback logic
 */
export const getLeagueIcon = (leagueName: string): string | null => {
  const name = leagueName.toLowerCase();
  
  // Try exact match first
  if (LEAGUE_ICONS[name]) {
    return LEAGUE_ICONS[name];
  }
  
  // Try partial matches for variants
  for (const [key, icon] of Object.entries(LEAGUE_ICONS)) {
    if (name.includes(key) || key.includes(name.split(' ')[0])) {
      return icon;
    }
  }
  
  return null;
};

export const ESPORTS_CONFIG = {
  /**
   * Match time display configuration
   */
  TIME_LABELS: {
    STARTING: 'Starting...',
    LIVE_THRESHOLD_MINUTES: 1,
    HOURS_DISPLAY_THRESHOLD: 60
  },

  /**
   * Match state display configuration
   */
  MATCH_STATES: {
    inProgress: { text: 'LIVE', color: 'text-red-400 bg-red-900/20' },
    completed: { text: 'FINISHED', color: 'text-green-400 bg-green-900/20' },
    default: { text: 'UPCOMING', color: 'text-blue-400 bg-blue-900/20' }
  },

  /**
   * Stream display limits
   */
  MAX_VISIBLE_STREAMS: 4,

  /**
   * Demo feature configuration
   */
  DEMO: {
    ENABLED: true,
    PATCH_VERSION: '14.19'
  }
} as const;