# Scripts

This directory contains development and utility scripts for the League Cheat Sheet application.

## Available Scripts

### `list-champions.js`

A Node.js script that fetches and displays League of Legends champion data with accurate position information.

**Data Sources:**
- Community Dragon API: https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json
- Riot Data Dragon API: https://ddragon.leagueoflegends.com

**Features:**
- ✅ Real-time API data (no hardcoded champion information)
- ✅ Accurate position mapping from Community Dragon API
- ✅ Service-oriented architecture matching our React app (`src/lib/`)
- ✅ Role-to-position translation (mage→Mid/Support, fighter→Top/Jungle, etc.)
- ✅ Position breakdown statistics
- ✅ JSON export functionality

**Usage:**
```bash
# Run the script
node scripts/list-champions.js

# View position breakdown only
node scripts/list-champions.js | grep -A 10 "POSITION BREAKDOWN"

# Show first 20 champions
node scripts/list-champions.js | head -30
```

**Architecture:**
The script uses the same service pattern as our React application:
- `CommunityDragonService`: Handles position data fetching and mapping
- `RiotApiService`: Handles champion metadata from Data Dragon API
- Pure API-driven approach with no hardcoded champion data