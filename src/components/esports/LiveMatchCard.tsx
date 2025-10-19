'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Match } from '@/lib/esports/api';
import { getLeagueIcon, ESPORTS_CONFIG } from '@/lib/esports/config';
import LiveGameStats from './LiveGameStats';
import EmbeddedStreamPlayer from './EmbeddedStreamPlayer';
import { LiveGameStatsView } from './LiveGameStatsView';
import { LiveEventWatcher } from './LiveEventWatcher';
import { useLiveGameStats } from '@/hooks/useEsports';
import TwitchIcon from '@/components/icons/TwitchIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';
import LiveBadge from '@/components/icons/LiveBadge';
import RedDot from '@/components/icons/RedDot';
import { guessTeamLogo } from '@/lib/esports/teamLogos';

interface LiveMatchCardProps {
  match: Match;
}

interface StreamData {
  mediaLocale: {
    englishName: string;
    translatedName: string;
  };
  provider: string;
  parameter?: string;
  locale?: string;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match }) => {
  const [showStream, setShowStream] = useState(true); // Auto-show stream by default
  const [isTheatreMode, setIsTheatreMode] = useState(false); // Theatre mode for stats
  const [showDetailedStats, setShowDetailedStats] = useState(false); // Show comprehensive stats view
  
  // Debug: Log match data to see what we're receiving
  React.useEffect(() => {
    const rawMatch = match as Match & Record<string, unknown>;
    console.log('🎴 [LiveMatchCard] Rendering with match:', {
      id: match.id,
      type: match.type,
      state: match.state,
      hasLiveGameStats: !!rawMatch.liveGameStats,
      hasCurrentGame: !!rawMatch.currentGame,
      hasStreams: !!(rawMatch.streams as unknown[])?.length,
      liveGameStatsKeys: rawMatch.liveGameStats ? Object.keys(rawMatch.liveGameStats) : null,
      currentGameData: rawMatch.currentGame
    });
    
    // Log the actual stats if available
    if (rawMatch.liveGameStats) {
      console.log('  📊 liveGameStats:', rawMatch.liveGameStats);
    }
    if (rawMatch.liveGameDetails) {
      console.log('  📋 liveGameDetails:', rawMatch.liveGameDetails);
    }
  }, [match]);
  
  const getMatchTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < ESPORTS_CONFIG.TIME_LABELS.LIVE_THRESHOLD_MINUTES) {
      return ESPORTS_CONFIG.TIME_LABELS.STARTING;
    }
    if (diffMins < ESPORTS_CONFIG.TIME_LABELS.HOURS_DISPLAY_THRESHOLD) {
      return `${diffMins}m`;
    }
    
    const hours = Math.floor(diffMins / ESPORTS_CONFIG.TIME_LABELS.HOURS_DISPLAY_THRESHOLD);
    const mins = diffMins % ESPORTS_CONFIG.TIME_LABELS.HOURS_DISPLAY_THRESHOLD;
    return `${hours}h ${mins}m`;
  };

  const getStateDisplay = (state: string) => {
    return ESPORTS_CONFIG.MATCH_STATES[state as keyof typeof ESPORTS_CONFIG.MATCH_STATES] || 
           ESPORTS_CONFIG.MATCH_STATES.default;
  };

  // Helper function to get platform-specific styling
  const getStreamPlatformStyle = (provider: string) => {
    const providerLower = provider.toLowerCase();
    if (providerLower === 'twitch') {
      return {
        icon: <TwitchIcon className="w-5 h-5" />,
        bgColor: 'bg-purple-600 hover:bg-purple-700',
        badgeColor: 'bg-purple-900/20 text-purple-300 border-purple-500/20 hover:bg-purple-800/30 hover:border-purple-400/40'
      };
    } else if (providerLower === 'youtube') {
      return {
        icon: <YouTubeIcon className="w-5 h-5" />,
        bgColor: 'bg-red-600 hover:bg-red-700',
        badgeColor: 'bg-red-900/20 text-red-300 border-red-500/20 hover:bg-red-800/30 hover:border-red-400/40'
      };
    }
    return {
      icon: <RedDot className="w-4 h-4" />,
      bgColor: 'bg-gray-600 hover:bg-gray-700',
      badgeColor: 'bg-gray-900/20 text-gray-300 border-gray-500/20 hover:bg-gray-800/30 hover:border-gray-400/40'
    };
  };

  // Helper function to format strategy type (bestOf -> Best of)
  const formatStrategyType = (type: string): string => {
    if (type === 'bestOf') return 'Best of';
    // Capitalize first letter for other types
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to get team side for current/specific game
  const getTeamSide = (teamId: string, gameNumber?: number): 'blue' | 'red' | null => {
    if (!match.games || match.games.length === 0) return null;
    
    // If game number specified, find that game, otherwise find the current game
    const targetGame = gameNumber 
      ? match.games.find(g => g.number === gameNumber)
      : match.games.find(g => g.state === 'inProgress') || match.games[match.games.length - 1];
    
    if (!targetGame) return null;
    
    const teamInGame = targetGame.teams.find(t => t.id === teamId);
    return teamInGame?.side || null;
  };

  // Helper function to get game status summary
  const getGamesSummary = () => {
    if (!match.games || match.games.length === 0) return null;
    
    const completed = match.games.filter(g => g.state === 'completed').length;
    const inProgress = match.games.find(g => g.state === 'inProgress');
    const total = match.strategy?.count || match.games.length;
    
    return {
      completed,
      current: inProgress?.number,
      total,
      inProgress: !!inProgress
    };
  };

  // Helper function to generate stream URLs
  const getStreamUrl = (stream: StreamData): string | null => {
    if (!stream.parameter) {
      console.warn('⚠️ [Stream] No parameter found for stream:', stream);
      return null;
    }
    
    const provider = stream.provider.toLowerCase();
    console.log(`🔗 [Stream] Generating URL for provider: ${provider}, parameter: ${stream.parameter}`);
    
    if (provider === 'twitch') {
      return `https://www.twitch.tv/${stream.parameter}`;
    } else if (provider === 'youtube') {
      // YouTube can use either video IDs or channel IDs
      // If parameter looks like a video ID (11 chars), use watch URL
      // If it looks like a channel/live URL, construct accordingly
      if (stream.parameter.includes('/')) {
        // Full URL path provided
        return `https://www.youtube.com${stream.parameter}`;
      } else if (stream.parameter.length === 11 || stream.parameter.startsWith('UC')) {
        // Standard video ID or channel ID
        return `https://www.youtube.com/watch?v=${stream.parameter}`;
      } else {
        // Assume it's a channel name or custom URL
        return `https://www.youtube.com/${stream.parameter}`;
      }
    }
    
    console.warn(`⚠️ [Stream] Unknown provider: ${provider}`);
    return null;
  };

  const stateInfo = getStateDisplay(match.state);

  // Extract additional data that might be available
  const rawMatch = match as Match & Record<string, unknown>;
  const league = rawMatch.league as { name?: string; slug?: string; image?: string } | undefined;
  const streams = (rawMatch.streams || []) as unknown[];
  const flags = (rawMatch.match as { flags?: unknown[] })?.flags || [];
  // Note: tournament data available but not used in current component
  const liveGameStats = rawMatch.liveGameStats;
  const currentGame = rawMatch.currentGame;
  const gamesSummary = getGamesSummary();
  
  // Get game ID and events for detailed stats
  const gameId = (currentGame as { id?: string })?.id;
  const { events } = useLiveGameStats(gameId || '');
  
  // Get team names for event notifications
  const blueTeam = match.teams?.[0];
  const redTeam = match.teams?.[1];

  return (
    <div className="bg-riot-gray/50 rounded-lg border border-gray-600 overflow-hidden hover:border-riot-blue/50 transition-colors">
      {/* Event Notifications */}
      {gameId && <LiveEventWatcher events={events} blueTeamName={blueTeam?.name} redTeamName={redTeam?.name} />}
      
      {/* Match Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${stateInfo.color}`}>
              {match.state === 'inProgress' && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />} {stateInfo.text}
            </span>
            {match.state === 'inProgress' && (
              <span className="ml-2 text-gray-400 text-sm">
                {getMatchTime(match.startTime)}
              </span>
            )}
          </div>
          <div className="text-right text-sm text-gray-400">
            <div className="font-medium">{match.blockName}</div>
            {match.strategy && (
              <div className="text-xs">{formatStrategyType(match.strategy.type)} {match.strategy.count}</div>
            )}
            {gamesSummary && gamesSummary.inProgress && (
              <div className="text-xs text-green-400 mt-1">
                Game {gamesSummary.current} of {gamesSummary.total}
              </div>
            )}
          </div>
        </div>

        {/* League Info */}
        {league && league.name && (
          <div className="flex items-center space-x-2 mt-2">
            {(league.image || getLeagueIcon(league.name)) ? (
              <Image
                src={league.image || getLeagueIcon(league.name) || ''} 
                alt={league.name} 
                width={20}
                height={20}
                className="w-5 h-5 rounded"
                unoptimized={true}
                onError={(e) => { 
                  const fallback = getLeagueIcon(league.name || '');
                  if (fallback && e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
            ) : (
              <div className="w-5 h-5 rounded bg-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-300 font-bold">
                  {league.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-300">{league?.name || ''}</span>
            {flags.includes('hasVod') && (
              <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">
                <TwitchIcon className="w-4 h-4" />
                VOD Available
              </span>
            )}
            {flags.includes('isSpoiler') && (
              <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-0.5 rounded">
                ⚠️ Spoiler
              </span>
            )}
          </div>
        )}

        {/* Stream Options for Shows */}
        {match.type === 'show' && streams.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400">Available in {streams.length} languages:</div>
            </div>
            
            {/* Primary Stream Link */}
            {streams.length > 0 && (() => {
              const primaryStream = streams[0] as StreamData;
              const streamUrl = getStreamUrl(primaryStream);
              const platformStyle = getStreamPlatformStyle(primaryStream.provider);
              return streamUrl ? (
                <a 
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block mb-2 text-center ${platformStyle.bgColor} text-white font-medium py-2 px-4 rounded transition-colors`}
                >
                  {platformStyle.icon} Watch Live on {primaryStream.provider}
                </a>
              ) : null;
            })()}
            
            <div className="flex flex-wrap gap-1">
              {(streams as StreamData[]).slice(0, ESPORTS_CONFIG.MAX_VISIBLE_STREAMS).map((stream: StreamData, index: number) => {
                const streamUrl = getStreamUrl(stream);
                const platformStyle = getStreamPlatformStyle(stream.provider);
                return streamUrl ? (
                  <a
                    key={index}
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs ${platformStyle.badgeColor} px-2 py-1 rounded border transition-colors`}
                    title={`Watch in ${stream.mediaLocale.englishName} on ${stream.provider}`}
                  >
                    {stream.mediaLocale.translatedName}
                  </a>
                ) : (
                  <span 
                    key={index}
                    className={`text-xs ${platformStyle.badgeColor} px-2 py-1 rounded border`}
                    title={`${stream.mediaLocale.englishName} - ${stream.provider}`}
                  >
                    {stream.mediaLocale.translatedName}
                  </span>
                );
              })}
              {streams.length > 4 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{streams.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Teams or Event Info */}
      <div className="p-4">
        {match.type === 'show' ? (
          <div className="text-center py-6">
            <div className="text-lg font-medium text-white mb-2">
              🎬 Live Broadcast
            </div>
            <div className="text-gray-400 mb-3">
              Watch live esports content on the official stream
            </div>
            {streams.length > 0 && (
              <div className="text-sm text-gray-300">
                <div className="mb-1">🌐 Streaming on {(streams[0] as StreamData)?.provider || 'Twitch'}</div>
                <div className="text-xs text-gray-400">
                  Multiple language options available
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {match.teams?.map((team, index) => {
              const teamSide = getTeamSide(team.id);
              return (
                <div key={team.id || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={team.image || guessTeamLogo((team as any).slug || team.name)}
                      alt={team.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border border-gray-500"
                      unoptimized={true}
                      onError={(e) => {
                        e.currentTarget.src = '/default-team-logo.png';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{team.name}</span>
                        {teamSide && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            teamSide === 'blue' 
                              ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' 
                              : 'bg-red-900/40 text-red-300 border border-red-500/30'
                          }`}>
                            {teamSide.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{team.code}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {team.result && (
                      <div className={`text-lg font-bold ${
                        team.result.outcome === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {team.result.gameWins}
                        {match.state === 'completed' && (
                          <span className="ml-1 text-sm">
                            {team.result.outcome === 'win' ? '👑' : ''}
                          </span>
                        )}
                      </div>
                    )}
                    {team.record && (
                      <div className="text-xs text-gray-400 mt-1">
                        Season: {team.record.wins}W-{team.record.losses}L
                      </div>
                    )}
                  </div>
                </div>
              );
            }) || (
              <div className="text-center text-gray-400 py-4">
                <div className="text-sm">Teams information not available</div>
              </div>
            )}
            
            {/* Embedded Stream Player for Live Matches */}
            {match.state === 'inProgress' && streams.length > 0 && (
              <div className="pt-3">
                {showStream ? (
                  <div className="space-y-2">
                    <EmbeddedStreamPlayer 
                      streams={streams as StreamData[]}
                      onClose={() => setShowStream(false)}
                      onToggleTheatre={() => setIsTheatreMode(!isTheatreMode)}
                      isTheatreMode={isTheatreMode}
                    />
                    <div className="text-center">
                      <button
                        onClick={() => setShowStream(false)}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Hide stream
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => setShowStream(true)}
                      className="bg-riot-blue hover:bg-riot-blue-hover text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      <span className="flex items-center gap-2"><TwitchIcon className="w-4 h-4" /> Show Embedded Stream</span>
                    </button>
                    <div className="mt-2 text-xs text-gray-400">
                      Available in {streams.length} language{streams.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Match Stats Footer for matches */}
            {match.teams && match.strategy && (
              <div className="pt-3 mt-3 border-t border-gray-600">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatStrategyType(match.strategy.type)} {match.strategy.count}</span>
                  <div className="flex items-center space-x-2">
                    {gamesSummary && (
                      <span className="text-gray-300">
                        {gamesSummary.completed}/{gamesSummary.total} games
                      </span>
                    )}
                    {flags.length > 0 && (
                      <div className="flex space-x-2">
                                    {flags.includes('hasVod') && <TwitchIcon className="w-4 h-4" />}
                        {flags.includes('isSpoiler') && <span>⚠️</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Live Game Stats - Always show when available */}
        {liveGameStats ? (
          <div className="mt-3">
            <div className="mb-2 text-center text-xs py-1 px-2 rounded border">
              {rawMatch.isCurrentGameLive ? (
                <div className="bg-blue-900/20 text-blue-300 border-blue-500/20">
                  <span className="flex items-center gap-2"><LiveBadge>LIVE</LiveBadge> Real-time match data (Game {(currentGame as { number?: number })?.number || '?'})</span>
                </div>
              ) : (
                <div className="bg-gray-900/20 text-gray-300 border-gray-500/20">
                  📊 Game {(currentGame as { number?: number })?.number || '?'} Final Stats {(currentGame as { state?: string })?.state === 'completed' ? '(Completed)' : ''}
                </div>
              )}
            </div>
            <LiveGameStats 
              gameStats={liveGameStats as unknown as Parameters<typeof LiveGameStats>[0]['gameStats']} 
              gameDetails={rawMatch.liveGameDetails as unknown as Parameters<typeof LiveGameStats>[0]['gameDetails']}
              currentGame={currentGame as unknown as Parameters<typeof LiveGameStats>[0]['currentGame']} 
            />
            
            {/* Toggle Detailed Stats Button */}
            {gameId && (
              <div className="mt-3 text-center space-y-3">
                <button
                  onClick={() => setShowDetailedStats(!showDetailedStats)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-riot-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                >
                  <span>{showDetailedStats ? '📊' : '📈'}</span>
                  <span>{showDetailedStats ? 'Hide' : 'Show'} Detailed Stats</span>
                  <span className="text-xs opacity-75">
                    {showDetailedStats ? '(Collapse)' : '(Charts, Items, Events)'}
                  </span>
                </button>
                
                {!showDetailedStats && (
                  <div className="text-xs text-gray-400">
                    Real-time gold chart, detailed player stats, and event notifications
                  </div>
                )}
                
                {/* Also provide link to dedicated page */}
                <Link 
                  href={`/esports/live/${gameId}`}
                  className="text-xs text-riot-gold hover:text-riot-blue transition-colors inline-flex items-center gap-1"
                >
                  <span>🔗</span>
                  <span>Open in dedicated page</span>
                </Link>
              </div>
            )}
            
            {/* Detailed Stats View - Expandable */}
            {showDetailedStats && gameId && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <LiveGameStatsView 
                  gameId={gameId}
                  blueTeamName={blueTeam?.name}
                  redTeamName={redTeam?.name}
                  blueTeamLogo={blueTeam?.image}
                  redTeamLogo={redTeam?.image}
                />
              </div>
            )}
          </div>
        ) : currentGame && !rawMatch.isCurrentGameLive ? (
          <div className="mt-3 text-center py-4 bg-gradient-to-br from-riot-dark/80 to-riot-gray/50 rounded border border-gray-600">
            <div className="text-lg mb-2">⏸️</div>
            <div className="text-sm font-medium text-white mb-1">Between Games</div>
            <div className="text-xs text-gray-400">
              Game {(currentGame as { number?: number })?.number || '?'} has ended. Waiting for next game to start...
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Stats will appear when the next game begins
            </div>
          </div>
        ) : match.state === 'inProgress' && match.type === 'match' ? (
          <div className="mt-3 text-center text-sm text-gray-400 py-3 bg-riot-dark/50 rounded">
            <div className="mb-1">📊 Live stats not available for this match</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

LiveMatchCard.displayName = 'LiveMatchCard';

// Custom comparison function - only re-render if stats data actually changed
const arePropsEqual = (prevProps: LiveMatchCardProps, nextProps: LiveMatchCardProps) => {
  // Always re-render if match ID changed
  if (prevProps.match.id !== nextProps.match.id) {
    return false;
  }
  
  // Check if live game stats changed (this is what updates every 30 seconds)
  const prevMatch = prevProps.match as Match & Record<string, unknown>;
  const nextMatch = nextProps.match as Match & Record<string, unknown>;
  
  const prevStats = prevMatch.liveGameStats as { frames?: unknown[] } | null | undefined;
  const nextStats = nextMatch.liveGameStats as { frames?: unknown[] } | null | undefined;
  
  // If stats existence changed, re-render
  if ((prevStats === null || prevStats === undefined) !== (nextStats === null || nextStats === undefined)) {
    return false;
  }
  
  // If both have stats, check if frame count changed (indicates new data)
  if (prevStats?.frames && nextStats?.frames) {
    const prevFrameCount = prevStats.frames.length;
    const nextFrameCount = nextStats.frames.length;
    if (prevFrameCount !== nextFrameCount) {
      return false; // Stats updated, re-render
    }
    
    // Also check the latest frame data for changes (kills, deaths, gold)
    const prevLatest = JSON.stringify(prevStats.frames[prevStats.frames.length - 1]);
    const nextLatest = JSON.stringify(nextStats.frames[nextStats.frames.length - 1]);
    if (prevLatest !== nextLatest) {
      return false; // Latest stats changed, re-render
    }
  }
  
  // Otherwise, props are equal, don't re-render
  return true;
};

export default memo(LiveMatchCard, arePropsEqual);