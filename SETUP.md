# LoL Champion Guide - Setup Instructions

This is a Next.js PWA application for League of Legends champions built based on the prototype design.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 PWA Features

- **Offline-first**: Works completely offline after first load
- **Installable**: Can be installed on mobile devices
- **Cached API calls**: Champions data cached for 24 hours
- **Local storage**: Favorites persist between sessions

## 🎮 Features Implemented

### ✅ Complete Features
- **Champion List**: All 165+ champions displayed
- **Search**: Real-time champion search
- **Favorites**: Add/remove favorites with localStorage
- **Champion Details**: Full modal with tabs:
  - Overview: Lore, stats, gallery
  - Abilities: All 5 abilities with descriptions
  - Skins: Complete skin collection
- **Mobile-first Design**: Optimized for phone usage
- **API Caching**: Smart caching with version management
- **PWA Ready**: Service worker, manifest, offline support

### 🚧 In Progress
- **Items Tab**: Placeholder ready for implementation
- **Additional Polish**: Performance optimizations

## 🔧 Technical Details

### Tech Stack
- **Next.js 15.x** with App Router
- **React 19.x** with TypeScript
- **Tailwind CSS** for styling
- **PWA** with service worker caching
- **Riot Data Dragon API** (no API key required)

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # API services and utilities
└── types/              # TypeScript type definitions
```

### API Integration
- **Dynamic versioning**: Auto-fetches latest API version
- **Smart caching**: 24-hour cache with localStorage
- **Offline support**: Works without internet after initial load
- **Error handling**: Graceful fallbacks and retry logic

## 📸 Screenshots

The app matches the prototype design with:
- Blue/purple gradient favorites section
- Full-height champion splash images
- Complete champion lore and abilities
- Tabbed champion details (Overview/Abilities/Skins)
- Mobile-optimized list view

## 🔄 Data Refresh

- **Manual Sync**: Tap the "🔄 Sync" button to refresh data
- **Auto Cache**: Data automatically updates after 24 hours
- **Offline Mode**: Full functionality without internet connection

## 🎯 Next Steps

1. **Install dependencies** and run the development server
2. **Test on mobile** for optimal experience
3. **Install as PWA** on your phone for native app feel
4. **Customize favorites** and explore champion details
5. **Include Skill use** Use same videos that https://www.leagueoflegends.com/en-us/champions/aatrox/ uses.

The application is ready for immediate use and matches all the requirements from the original specifications!