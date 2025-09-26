# League of Legends Cheat Sheet

A comprehensive **Next.js Progressive Web App (PWA)** for League of Legends players featuring champions, summoner spells, and items data. Built with mobile-first design and offline functionality.

## 🚀 Features

### Multi-Tab Navigation
- **Champions**: Browse all champions with favorites system and ability videos
- **Summoner Spells**: Complete summoner spell database
- **Items**: Comprehensive item catalog with stats and build information
- **Teams**: Complete multi-step team builder with configuration management (✅ Phase 3 Complete)
- **Esports**: Live matches, schedules, and professional League data (✅ Complete)

### Champion Management
- **Champion List**: All champions displayed in alphabetical order
- **Favorites System**: 
  - Favorite/unfavorite champions with persistent storage
  - Favorited champions displayed prominently at top
  - Personal notes and player name tracking for favorited champions
- **Champion Details**: Detailed modal view with:
  - Champion images (portrait, loading screen, splash art)
  - Lore and gameplay description
  - All abilities with icons and detailed descriptions
  - **Ability Videos**: Interactive video player for each ability (P/Q/W/E/R)
    - Custom tap-to-play/pause controls with SVG icons
    - Official 1056x720 aspect ratio maintained
    - Ability icons used as video thumbnails
    - Full-width responsive layout
  - Champion statistics and tags
  - External guide links (Mobalytics integration)

### Summoner Spells & Items
- **Summoner Spells**: Complete spell database with descriptions and cooldowns
- **Items**: Full item catalog with:
  - Item stats and gold costs
  - Build paths and item tags
  - Searchable by name, description, or tags
  - Tap-away modal closing for mobile optimization

### Teams & Configuration Management
- **Multi-Step Team Builder**: Comprehensive 4-step team setup process
  - **Step 1**: Team names configuration
  - **Step 2**: Player names and position assignment
  - **Step 3**: Champion selection with duplicate prevention
  - **Step 4**: Summoner spell assignment
- **Professional UI System**: 
  - Riot-themed design matching League of Legends aesthetic
  - Modern modal system replacing browser alerts
  - Toast notification system (success/error/info/warning)
- **Configuration Management**:
  - Save/load team configurations with persistent storage
  - Reset functionality returning to step 1
  - Visual configuration browser with metadata
- **Cross-Browser Compatibility**: 
  - Fixed Firefox-specific navigation issues
  - Consistent behavior across Safari, Chrome, and Firefox

### Offline & Performance
- **PWA Features**: Installable app with offline support
- **Smart Caching**: 24-hour cache with manual refresh capability
- **Local Storage**: Favorites and data persistence
- **Mobile Optimized**: Touch-friendly interface designed for phones

## 🛠 Technical Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **PWA**: Next-PWA for offline functionality
- **API**: Riot Games Data Dragon API (no keys required)
- **Storage**: Browser localStorage for caching and favorites

## 🏗 Development

### Getting Started
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
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── teams/          # Team builder components (MultiStepTeamBuilder, TeamView, etc.)
│   ├── esports/        # Professional League components
│   ├── modals/         # Modern modal system (ConfirmationModal, InputModal, etc.)
│   └── ui/             # UI components (ToastContainer, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API services
├── types/              # TypeScript type definitions
└── contexts/           # React context providers
```

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

## 📋 Current TODOs & Action Items

### 🔥 High Priority - Active Development
- ✅ **Esports Tab Completion** (`src/app/esports/page.tsx`) - **COMPLETED**:
  - ✅ Imported and implemented StandingsTable component
  - ✅ Added standings functionality with league tables
  - ✅ Completed standings tab integration with proper error handling
  - ✅ Code organization with type definitions and configuration files

- ✅ **Teams Tab Phase 3** (`src/components/teams/TeamView.tsx`) - **COMPLETED**:
  - ✅ Complete multi-step team builder implementation
  - ✅ Professional UI system with riot-themed design
  - ✅ Configuration save/load/reset system
  - ✅ Modern modal system replacing browser alerts
  - ✅ Cross-browser compatibility (Firefox navigation fix)
  - ✅ Toast notification system integration

### 🎯 Medium Priority - Code Quality
- ✅ **Code Organization** - **COMPLETED**:
  - ✅ Moved esports interfaces to dedicated `/types` directory
  - ✅ Extracted static URLs to configuration files
  - ✅ Added proper TypeScript organization with esports config
  - ✅ Modern component architecture with modal system

- ✅ **UI/UX Modernization** - **COMPLETED**:
  - ✅ Eliminated all browser alerts in favor of in-app modals
  - ✅ Implemented professional toast notification system
  - ✅ Riot-themed button design matching site aesthetic
  - ✅ Tap-away modal functionality for mobile optimization

- [ ] **Build Algorithm Enhancement** (`src/utils/buildPathAlgorithms.ts`):
  - Implement item alternatives logic for better recommendations
  - Add situational build suggestions
  - Add JSDoc comments to API functions

### 🚀 Future Features - Next Phase
- [ ] **Advanced Team Analysis Tools**:
  - Team composition analysis and insights  
  - Build recommendation algorithms
  - Win condition identification

- [ ] **Enhanced Item Building**:
  - Live gold tracking during games
  - Item build path visualization
  - Situational item suggestions

- [ ] **Professional Integration**:
  - Professional match analysis integration with team builds
  - Meta trend analysis and recommendations
  - Tournament bracket planning tools

## 📋 Roadmap & TODOs

### Immediate Improvements
- [ ] Enhanced search with filtering options
- [ ] Item build paths visualization

### Future Features: Players Tab
A comprehensive team management system:

#### Core Features
- [ ] **Team Setup**: 6 players per team (Red vs Blue)
- [ ] **Player Management**: 
  - Custom player names
  - Champion selection per player
  - Summoner spell assignment
- [ ] **Live Item Building**:
  - Real-time item building during games
  - Item upgrade suggestions
  - Build path recommendations
  - Interactive item trees

#### Technical Considerations
- [ ] Investigate item build tree data from API
- [ ] Real-time state management for live games
- [ ] Team composition analysis
- [ ] Save/load team configurations

## 🤝 Contributing

This project uses:
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Tailwind CSS** for consistent styling

## 📝 License

This project is for educational purposes. League of Legends is a trademark of Riot Games, Inc.