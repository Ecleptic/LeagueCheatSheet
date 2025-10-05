# Embedded Stream Support

## Overview

The esports page now supports **embedded streaming** directly in the browser. Live matches automatically show an embedded stream player with intelligent language/platform selection.

## Features

### 🎯 Smart Stream Selection
The player automatically selects the best available stream based on priority:

1. **YouTube English** (highest priority)
2. **Twitch English**
3. **YouTube Korean**
4. **Twitch Korean**
5. **Any YouTube stream**
6. **Any Twitch stream**
7. **First available stream** (fallback)

### 🎬 Embedded Players

#### YouTube Streams
- Full HD embedded player
- Autoplay enabled
- Minimal YouTube branding
- Related videos disabled
- Example URL formats:
  - `https://www.youtube.com/embed/{videoId}`
  - Parsed from various YouTube URL formats

#### Twitch Streams
- Native Twitch player embed
- Channel-based streaming
- Autoplay enabled
- Parent domain validation for security
- Example URL: `https://player.twitch.tv/?channel={channelName}`

### 🎮 User Controls

#### Language Selector
- Dropdown menu to switch between available streams
- Shows all languages and platforms
- Format: `{Language} ({Platform})`

#### Fullscreen Mode
- Button to enter/exit fullscreen
- Optimized player size
- Minimal UI in fullscreen

#### Show/Hide Stream
- Auto-shown by default for live matches
- "Hide stream" button to collapse player
- "Show Embedded Stream" button to re-open
- Saves screen space when viewing stats

### 📊 Stream Information

The player displays:
- **Language name** (e.g., "English", "Korean")
- **Platform** (YouTube/Twitch)
- **Live indicator** (🔴 LIVE)
- **Available languages count**

## Technical Implementation

### Component: `EmbeddedStreamPlayer.tsx`

Located: `/src/components/esports/EmbeddedStreamPlayer.tsx`

**Props:**
```typescript
interface EmbeddedStreamPlayerProps {
  streams: StreamData[];  // Array of available streams
  onClose?: () => void;   // Optional close handler
}

interface StreamData {
  mediaLocale: {
    englishName: string;
    translatedName: string;
    locale?: string;
  };
  provider: string;
  parameter?: string;
}
```

**Key Functions:**
- `selectBestStream(streams)` - Implements priority-based stream selection
- `getEmbedUrl(stream)` - Generates platform-specific embed URLs
- Language switching with dropdown
- Fullscreen toggle functionality

### Integration: `LiveMatchCard.tsx`

The embedded player is integrated into live match cards:

```typescript
const [showStream, setShowStream] = useState(true); // Auto-show by default

// In render:
{match.state === 'inProgress' && streams.length > 0 && (
  <EmbeddedStreamPlayer 
    streams={streams as StreamData[]}
    onClose={() => setShowStream(false)}
  />
)}
```

## User Experience

### Default Behavior
- **Live matches automatically show embedded stream** (showStream = true)
- Best stream pre-selected based on priority
- Responsive player (16:9 aspect ratio)

### Mobile/Responsive
- Works on mobile devices
- Touch-friendly controls
- Fullscreen support on mobile

### Error Handling
- Fallback message if no streams available
- Graceful handling of embed failures
- Informative error messages

## Platform-Specific Details

### YouTube Embed
- URL: `https://www.youtube.com/embed/{videoId}`
- Query parameters:
  - `autoplay=1` - Auto-start video
  - `modestbranding=1` - Minimal YouTube logo
  - `rel=0` - Disable related videos

### Twitch Embed
- URL: `https://player.twitch.tv/`
- Query parameters:
  - `channel={channelName}` - Stream channel
  - `parent={hostname}` - Security requirement
  - `autoplay=true` - Auto-start stream

### Security
- Twitch requires `parent` domain validation
- Automatically uses `window.location.hostname`
- Supports localhost for development

## Styling

### Platform Colors
- **YouTube**: Red theme (`text-red-400`, `bg-red-600`)
- **Twitch**: Purple theme (`text-purple-400`, `bg-purple-600`)

### Layout
- Dark theme consistent with esports page
- Border: `border-gray-600`
- Background: `bg-riot-dark` / `bg-riot-gray`
- Header with controls
- Footer with live indicator

### Icons
- YouTube: ▶️
- Twitch: 📺
- Live indicator: 🔴

## Testing

### Check Embedded Stream
1. Visit `/esports` page
2. Look for live matches (🔴 LIVE badge)
3. Embedded player should auto-show
4. Verify stream plays automatically

### Test Language Switching
1. If multiple streams available, dropdown appears
2. Select different language
3. Player should reload with new stream

### Test Fullscreen
1. Click fullscreen button (expand icon)
2. Player should fill screen
3. Click again to exit fullscreen

### Test Show/Hide
1. Click "Hide stream" button
2. Player collapses
3. Click "Show Embedded Stream" button
4. Player re-appears

## Known Limitations

### Stream Availability
- Streams must be **actively live** to embed
- Pre-match or post-match may not have embeddable streams
- Some regions may have geo-restrictions

### Platform Restrictions
- **Twitch** requires parent domain validation
- **YouTube** may have age restrictions on some content
- Some streams may be "watch on platform only"

### Browser Support
- Requires iframe support (all modern browsers)
- Autoplay may require user interaction on some browsers
- Fullscreen API varies by browser

## Future Enhancements

### Potential Features
- [ ] Picture-in-picture mode
- [ ] Volume controls
- [ ] Chat integration
- [ ] Multi-stream view (side-by-side)
- [ ] Stream quality selector
- [ ] Remember user's language preference
- [ ] Synchronized stats with stream timestamp

## Troubleshooting

### Stream Not Showing
- **Check console logs** for API errors
- **Verify match is live** (state === 'inProgress')
- **Check streams array** has valid data
- **Check parameter field** exists for stream

### Embed Fails to Load
- **YouTube**: Check video ID is valid
- **Twitch**: Verify channel name is correct
- **Network**: Check internet connection
- **Ad blockers**: May interfere with embeds

### No Language Selector
- Only shows if `streams.length > 1`
- Single stream = no dropdown needed

### Autoplay Not Working
- Some browsers block autoplay without user interaction
- Click play button if stream doesn't auto-start
- Check browser autoplay settings

## API Data Structure

The component expects stream data from the LoL Esports API:

```json
{
  "streams": [
    {
      "parameter": "lolesports",
      "locale": "en-US",
      "mediaLocale": {
        "locale": "en-US",
        "englishName": "English",
        "translatedName": "English"
      },
      "provider": "twitch",
      "countries": ["US"],
      "offset": 0,
      "statsId": "123456"
    }
  ]
}
```

### Important Fields
- `parameter`: Channel name (Twitch) or video ID (YouTube)
- `provider`: "twitch" or "youtube"
- `mediaLocale.englishName`: Language name
- `mediaLocale.translatedName`: Localized language name

## Conclusion

The embedded stream feature brings live esports directly into the cheat sheet application, eliminating the need to switch between tabs or windows. With smart stream selection and platform-specific optimizations, users get the best viewing experience automatically.
