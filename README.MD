# League of Legends Spectator Guide

**Your quick reference companion for watching League of Legends esports** 🎮📺

A comprehensive **Next.js Progressive Web App (PWA)** designed to help new viewers understand what's happening in professional League matches. Whether you're watching LCS, LCK, or Worlds, this app helps you quickly look up champions, items, abilities, and follow live matches in real-time.

## 🎯 Purpose

**Not a player guide** - This is specifically built for **spectators and new esports fans** who want to:
- Understand what champions and their abilities do
- Learn what items players are building and why
- Follow live professional matches with detailed stats
- Decode esports terminology and strategies
- Get instant answers during matches without leaving the stream

Perfect for friends, family, or newcomers trying to understand what the casters are talking about!

## 🚀 Key Features

### 📺 Live Match Tracking (`/esports`)
**Follow professional matches in real-time:**
- **Live Game Stats**: Real-time gold difference charts, objectives, and player stats
- **Expandable Details**: Click "Show Detailed Stats" on any live match to see:
  - Gold difference visualization with team comparison
  - Dragon tracking (which team got which dragons)
  - Tower, baron, and inhibitor counts
  - Individual player stats: K/D/A, CS, gold, items
  - Champion images and health bars
- **Event Notifications**: Toast alerts for first blood, kills, objectives, and major events
- **Schedule & Results**: Upcoming matches and recent game results
- **League Standings**: Current tournament tables and team rankings
- **Mobile Optimized**: Tab navigation for easy viewing on phones

### 🏆 Champion Reference (Main Page)
**Quickly understand what champions do:**
- **Browse All Champions**: Alphabetical list with search
- **Ability Videos**: Watch what each ability (P/Q/W/E/R) actually does
  - Tap-to-play video demonstrations
  - See the visual effects and range
  - Perfect for "What did that champion just do?" moments
- **Favorites System**: Star champions you see often to access them faster
- **Champion Details**: 
  - All ability descriptions and cooldowns
  - Passive effects explained
  - Champion role and playstyle tags
  - External guides for deeper learning

### 🎒 Item Database
**Understand item builds and power spikes:**
- **Item Catalog**: Every item with stats and gold costs
- **Build Paths**: See what items build into (e.g., "Why is the ADC buying that component?")
- **Search & Filter**: Find items by name or effect
- **Quick Reference**: Tap an item to see full stats and description
- **Build Analysis**: Understand why pros build certain items

### ⚡ Summoner Spells
**Know what spells do and their cooldowns:**
- Complete spell database (Flash, Teleport, Ignite, etc.)
- Cooldown timers (important for understanding windows of opportunity)
- Effect descriptions in plain language

### 📖 Esports Terminology Guide
**Coming Soon**: Common terms explained:
- ADC, Support, Jungle, Mid, Top (Positions)
- CS (Creep Score), Gold Difference, Vision Control
- Dragon Soul, Baron Buff, Elder Dragon
- Split Push, Team Fight, Siege, Poke
- First Blood, Ace, Pentakill
- Draft, Ban Phase, Blue/Red Side

### 📱 Spectator-Friendly Design
- **Dual Screen Setup**: Keep this open on your phone/tablet while watching on TV
- **Quick Lookups**: Find info in seconds, get back to the action
- **No Game Knowledge Required**: Everything explained for newcomers
- **Offline Support**: Works without internet (after first load)
- **PWA Install**: Add to home screen for instant access during streams

## � Common Use Cases

### During a Live Match
**"What does that champion do?"**
→ Open Champions tab, search for the champion, watch ability videos

**"Why is everyone excited about Dragon Soul?"**
→ Check the live stats to see which dragons each team has taken

**"What items is the ADC building?"**
→ Expand the detailed stats to see real-time item builds

**"Who's winning?"**
→ Check the gold difference chart in the live match view

**"What's the score in this series?"**
→ Look at the match card to see game wins (e.g., 2-1)

### Between Games
**"I keep hearing about [champion name]"**
→ Add them to favorites for quick access next time

**"What does Flash do again?"**
→ Quick check in Summoner Spells tab

**"When are the next matches?"**
→ Switch to Schedule tab in /esports

### Learning Over Time
- Favorite the 20-30 most-played champions in pro play
- Watch ability videos once, remember what they look like
- Learn item names by checking builds during matches
- Track your favorite team's standings

## 🛠 Technical Stack

- **Framework**: Next.js 15.5.4 (Fast, modern, works offline)
- **Data Source**: Riot Games Official API (always up-to-date)
- **Live Stats**: Real-time esports data from Riot's livestats API
- **PWA**: Installable app that works offline
- **Mobile First**: Designed for phone/tablet viewing alongside streams

## 🚀 Quick Start Guide

### For Spectators

1. **Visit the App**: `http://localhost:3001` (or deployed URL)
2. **First Time Setup**:
   - Browse Champions tab and favorite 5-10 you see often
   - Check out ability videos for popular picks
3. **During Matches**:
   - Open `/esports` page
   - Click "Show Detailed Stats" on live matches
   - Keep app open on phone while watching stream
4. **Learning**:
   - Look up unfamiliar champions during loading screen
   - Check item builds when casters mention them
   - Watch ability videos after seeing cool plays

### Keyboard Shortcuts (Coming Soon)
- `Space`: Quick search
- `ESC`: Close modals
- `Tab`: Navigate sections

## 🏗 Development

### For Developers
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── esports/        # Live match tracking (/esports)
│   └── page.tsx        # Champions, items, spells (/)
├── components/
│   ├── esports/        # Live stats, match cards, event notifications
│   ├── modals/         # Modal system for details
│   └── ui/             # Reusable UI components
├── hooks/              # Data fetching and state management
│   └── useEsports.ts   # Live match polling and events
├── lib/                # API clients and utilities
│   ├── esports/        # Riot esports API integration
│   └── riot-api.ts     # Data Dragon API client
└── types/              # TypeScript definitions
    └── esports.ts      # Live match data types
```

### Key Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hooks**: State management and data fetching
- **PWA**: Offline-first progressive web app

## 🌐 API Integration

### Riot Games Data Dragon API
The app uses [Riot's Data Dragon API](https://developer.riotgames.com/docs/lol#data-dragon) - no API keys required!

### Dynamic Version Management
```
GET https://ddragon.leagueoflegends.com/api/versions.json
```
- Automatically fetches latest game version
- Cached for 24 hours to minimize requests
- Used for all subsequent API calls

### Primary Data Endpoints
| Resource | Endpoint |
|----------|----------|
| Champions | `/cdn/{VERSION}/data/en_US/champion.json` |
| Individual Champion | `/cdn/{VERSION}/data/en_US/champion/{ChampionName}.json` |
| Summoner Spells | `/cdn/{VERSION}/data/en_US/summoner.json` |
| Items | `/cdn/{VERSION}/data/en_US/item.json` |

### Image Resources
| Type | URL Pattern |
|------|-------------|
| Champion Portrait | `/cdn/{VERSION}/img/champion/{ChampionName}.png` |
| Champion Splash Art | `/cdn/img/champion/splash/{ChampionId}_{SkinNum}.jpg` |
| Champion Loading Screen | `/cdn/img/champion/loading/{ChampionId}_{SkinNum}.jpg` |
| Ability Videos | `/cdn/x/videos/champion-abilities/{ChampionKey}/ability_{ChampionKey}_{AbilityKey}1.mp4` |
| Ability Icons | `/cdn/{VERSION}/img/spell/{SpellImage}.png` |
| Passive Icons | `/cdn/{VERSION}/img/passive/{PassiveImage}.png` |
| Summoner Spell Icons | `/cdn/{VERSION}/img/spell/{SpellImage}.png` |
| Item Icons | `/cdn/{VERSION}/img/item/{ItemImage}.png` |

## 🎯 Roadmap - Spectator Features

### ✅ Completed
- **Live Match Tracking**: Real-time stats with gold charts and event notifications
- **Champion Reference**: All champions with ability videos
- **Item Database**: Complete catalog with build paths
- **Esports Schedule**: Upcoming matches and results
- **League Standings**: Tournament tables and rankings
- **Mobile Optimization**: Touch-friendly interface for dual-screen viewing

### 🚧 In Progress
- **Esports Terminology Guide**: Common terms and concepts explained
- **SVG Icons**: Replace emojis with proper dragon/baron/objective icons
- **Stream Integration**: Embed Twitch/YouTube streams alongside stats

### 📋 Future Enhancements

#### Spectator-Focused Features
- [ ] **Champion Role Guide**: Understanding positions (Top, Jungle, Mid, ADC, Support)
- [ ] **Item Timing Explained**: What "power spikes" mean and when they happen
- [ ] **Draft Phase Guide**: Understanding pick/ban strategy
- [ ] **Meta Snapshot**: Which champions are popular in current patch
- [ ] **Team Composition Analysis**: Understanding team fight vs. split push comps
- [ ] **Objective Timer Guide**: When dragon/baron spawns and respawns

#### Enhanced Learning Tools
- [ ] **Pro Player Profiles**: See what champions specific pros are known for
- [ ] **Historical Match Archive**: Look up past tournament games
- [ ] **Patch Notes Simplified**: Understanding what changed (for spectators)
- [ ] **Champion Matchup Guide**: Why certain picks counter others

#### Quality of Life
- [ ] **Multi-Language Support**: Watch streams in any language, read guides in yours
- [ ] **Dark/Light Mode**: Better viewing in different lighting
- [ ] **Comparison Tool**: Side-by-side champion/item comparisons
- [ ] **Quick Notes**: Save observations about players or strategies
- [ ] Team composition analysis
- [ ] Save/load team configurations

## 🤝 Contributing

This project uses:
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Tailwind CSS** for consistent styling

## � Credits & Resources

### Inspiration
This project's live stats feature was inspired by:
- **[AndyDanger/live-lol-esports](https://github.com/AndyDanger/live-lol-esports)** - Original live stats implementation
- **[Live Demo](https://andydanger.github.io/live-lol-esports/)** - See the original project in action

### API Resources
- **[Riot Games Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)** (`ddragon.leagueoflegends.com`) - Champion, item, and spell data with images
- **[LoL Esports API](https://vickz84259.github.io/lolesports-api-docs/)** (`esports-api.lolesports.com`) - Schedules, standings, and results
- **[LoL Esports Live Stats API](https://feed.lolesports.com/livestats/v1)** - Real-time match data (window & details endpoints)
- **[Community Dragon](https://raw.communitydragon.org/latest/)** - Champion positions and role data
- **[Static LoL Esports](https://static.lolesports.com/)** - League logos and tournament assets

### Libraries & Tools
- **[react-toastify](https://github.com/fkhadra/react-toastify)** - Event notification system
- **[next-pwa](https://github.com/shadowwalker/next-pwa)** - Progressive Web App support for offline viewing
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling framework
- **[Workbox](https://developer.chrome.com/docs/workbox/)** - Service worker for caching (via next-pwa)

## �📝 License

This project is for educational purposes. League of Legends is a trademark of Riot Games, Inc.