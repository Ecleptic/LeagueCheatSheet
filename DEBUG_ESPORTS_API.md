# Debugging Esports Live Stats API

## Current Status
The esports page is fetching data from the LoL Esports API, but live game statistics (champion picks, KDA, items) may not be showing up.

## How to Debug

### 1. Check Browser Console
Open the browser console (F12 or Cmd+Option+I) when viewing `/esports` page.

Look for these log messages:
- `🔍 [ESPORTS API] Total events from getLive():` - Shows total events returned
- `🔴 [ESPORTS API] Live events (inProgress):` - Shows how many are actually live
- `📊 [ESPORTS API] Fetching details for match event` - Shows when trying to get game details
- `✅ Found live game!` - Indicates a live game was found
- `🌐 [API] Fetching live game stats from:` - Shows the actual API URL being called
- `❌ [API] Error response body:` - Shows any API errors

### 2. Common Issues

#### No Live Matches
If you see `🔴 [ESPORTS API] Live events (inProgress): 0`, there are simply no matches happening right now.

**Solution:** Check https://lolesports.com/schedule to see when matches are scheduled.

#### Live Match but No Stats
If you see live events but no stats, look for these errors:
- `❌ Failed to get game stats for game XXX` - The livestats API is failing
- `⚠️ No live game found for event XXX` - The match exists but no individual game is in progress

#### API 404 Errors
The livestats API (`https://feed.lolesports.com/livestats/v1/`) may return 404 if:
- The game hasn't started yet (pre-game lobby)
- The game just ended (post-game screen)
- Stats aren't available for that league/tournament

### 3. Test with Real Data

**When matches are actually live:**
1. Go to https://lolesports.com/live
2. See if there are any matches currently streaming
3. Check the console logs on your `/esports` page
4. The API should attempt to fetch stats for those matches

### 4. API Endpoints Being Used

```
Main Events: https://esports-api.lolesports.com/persisted/gw/getLive
Event Details: https://esports-api.lolesports.com/persisted/gw/getEventDetails?id={eventId}
Live Stats: https://feed.lolesports.com/livestats/v1/window/{gameId}
Live Details: https://feed.lolesports.com/livestats/v1/details/{gameId}
```

### 5. Expected Console Output (When Working)

```
🔍 [ESPORTS API] Total events from getLive(): 15
🔴 [ESPORTS API] Live events (inProgress): 2
  1. Type: match, ID: 110852605605409123, State: inProgress
  2. Type: show, ID: 110852605605409124, State: inProgress
📊 [ESPORTS API] Fetching details for match event 110852605605409123...
  Found 3 games for event 110852605605409123
    Game 1: ID=110852605605409456, State=completed
    Game 2: ID=110852605605409457, State=inProgress
    Game 3: ID=110852605605409458, State=unstarted
  ✅ Found live game! ID: 110852605605409457, attempting to fetch stats...
🌐 [API] Fetching live game stats from: https://feed.lolesports.com/livestats/v1/window/110852605605409457
📡 [API] Response status: 200 OK
✅ [API] Successfully fetched game stats, data keys: ['esportsGameId', 'gameMetadata', 'frames']
  ✅ Successfully fetched game stats for game 110852605605409457
  Stats structure: ['esportsGameId', 'gameMetadata', 'frames']
    Has gameMetadata: ['patchVersion', 'blueTeamMetadata', 'redTeamMetadata']
🌐 [API] Fetching live game details from: https://feed.lolesports.com/livestats/v1/details/110852605605409457
📡 [API] Details response status: 200 OK
✅ [API] Successfully fetched game details
🎮 [ESPORTS API] Returning 2 enriched events
🎴 [LiveMatchCard] Rendering with match: {id: '110852605605409123', type: 'match', state: 'inProgress', hasLiveGameStats: true, hasCurrentGame: true}
```

### 6. Why You Might Only See Demo Data

The live stats API is **very specific** to when a game is actively being played. If:
- No matches are scheduled at this time
- Matches are in between games (pick/ban phase)
- Matches haven't reached the loading screen yet
- The tournament doesn't support live stats

Then the API won't return data, and you'll only see demo data when you manually click "Show Demo Stats".

### 7. Testing Right Now

To test if the API is working RIGHT NOW, run this in your browser console while on lolesports.com:

```javascript
fetch('https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US', {
  headers: {'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'}
})
.then(r => r.json())
.then(d => {
  const live = d.data?.schedule?.events?.filter(e => e.state === 'inProgress') || [];
  console.log('Live events:', live.length);
  console.log(live);
});
```

This will show you if there are ANY live events right now.

## Next Steps

1. **Build and run the app:** `npm run dev`
2. **Open browser console:** F12 or Cmd+Option+I
3. **Navigate to:** http://localhost:3002/esports
4. **Check the "Live" tab**
5. **Read the console logs** to see what's happening

If you see live matches but stats are failing, check the specific error messages in the console.
