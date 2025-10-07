import { NextResponse } from 'next/server';

const ESPORTS_API_BASE = 'https://esports-api.lolesports.com/persisted/gw';
const MATCH_DETAILS_BASE = 'https://feed.lolesports.com/livestats/v1';
const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

export const runtime = 'edge';

async function fetchWithHeaders(url: string) {
  const response = await fetch(url, {
    headers: {
      'x-api-key': API_KEY,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Origin': 'https://lolesports.com',
      'Referer': 'https://lolesports.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function GET() {
  try {
    console.log('🔍 [API Route] Fetching live matches...');

    // Try getLive first
    const liveData = await fetchWithHeaders(`${ESPORTS_API_BASE}/getLive?hl=en-US`);
    let events = liveData.data?.schedule?.events || [];

    console.log(`📊 [API Route] getLive returned ${events.length} events`);

    // Fallback to getSchedule if getLive is empty
    if (events.length === 0) {
      console.log('⚡ [API Route] getLive empty, trying getSchedule...');
      const scheduleData = await fetchWithHeaders(`${ESPORTS_API_BASE}/getSchedule?hl=en-US`);
      const allEvents = scheduleData.data?.schedule?.events || [];
      events = allEvents.filter((event: any) => event.state === 'inProgress');
      console.log(`📅 [API Route] getSchedule found ${events.length} inProgress events`);
    }

    // Filter for live matches
    const liveMatches = events.filter((event: any) => 
      event.state === 'inProgress' && event.type === 'match'
    );

    console.log(`🎮 [API Route] Processing ${liveMatches.length} live matches`);

    // Enrich each match with game stats
    const enrichedMatches = await Promise.all(
      liveMatches.map(async (event: any) => {
        const matchId = event.match?.id || event.id;
        
        try {
          // Get event details to find game IDs
          const eventDetails = await fetchWithHeaders(
            `${ESPORTS_API_BASE}/getEventDetails?hl=en-US&id=${matchId}`
          );
          
          const games = eventDetails.data?.event?.match?.games || [];
          console.log(`  Match ${matchId}: Found ${games.length} games`);

          // Find the live game
          let liveGame = games.find((game: any) => game.state === 'inProgress');

          // If no game marked inProgress, check each game for live data
          if (!liveGame && games.length > 0) {
            console.log(`  🔍 Checking each game for live data...`);
            for (const game of games) {
              if (game.id) {
                try {
                  const stats = await fetchWithHeaders(
                    `${MATCH_DETAILS_BASE}/window/${game.id}`
                  );
                  if (stats.frames && stats.frames.length > 0) {
                    console.log(`  ✅ Found live data in game ${game.id}`);
                    liveGame = game;
                    break;
                  }
                } catch {
                  // No data for this game, continue
                }
              }
            }
          }

          // Fetch stats for the live game
          if (liveGame?.id) {
            console.log(`  📊 Fetching stats for game ${liveGame.id}...`);
            
            const [gameStats, gameDetails] = await Promise.all([
              fetchWithHeaders(`${MATCH_DETAILS_BASE}/window/${liveGame.id}`).catch(() => null),
              fetchWithHeaders(`${MATCH_DETAILS_BASE}/details/${liveGame.id}`).catch(() => null),
            ]);

            if (gameStats) {
              console.log(`  ✅ Got stats with ${gameStats.frames?.length || 0} frames`);
            }

            return {
              ...event,
              liveGameStats: gameStats,
              liveGameDetails: gameDetails,
              currentGame: liveGame,
              isCurrentGameLive: true,
            };
          } else {
            console.log(`  ⚠️ No live game found for match ${matchId}`);
          }
        } catch (error) {
          console.error(`  ❌ Error processing match ${matchId}:`, error);
        }

        return event;
      })
    );

    console.log(`✅ [API Route] Returning ${enrichedMatches.length} enriched matches`);

    return NextResponse.json({
      success: true,
      matches: enrichedMatches,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('❌ [API Route] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      matches: [],
    }, { status: 500 });
  }
}
