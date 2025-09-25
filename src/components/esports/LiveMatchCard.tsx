'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/esports/api';
import { getLeagueIcon, ESPORTS_CONFIG } from '@/lib/esports/config';
import LiveGameStats from './LiveGameStats';

interface LiveMatchCardProps {
  match: Match;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ match }) => {
  const [showDemo, setShowDemo] = useState(false);
  
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

  const stateInfo = getStateDisplay(match.state);

  // Extract additional data that might be available
  const rawMatch = match as any;
  const league = rawMatch.league;
  const streams = rawMatch.streams || [];
  const flags = rawMatch.match?.flags || [];
  const tournament = rawMatch.tournament;
  const liveGameStats = rawMatch.liveGameStats;
  const currentGame = rawMatch.currentGame;

  // Demo data for testing the live statistics display
  const demoGameStats = {
    gameMetadata: {
      patchVersion: ESPORTS_CONFIG.DEMO.PATCH_VERSION,
      blueTeamMetadata: {
        participantMetadata: [
          { participantId: 1, summonerName: 'Player1', championId: 'Jinx', role: 'bot' },
          { participantId: 2, summonerName: 'Player2', championId: 'Thresh', role: 'support' },
          { participantId: 3, summonerName: 'Player3', championId: 'Graves', role: 'jungle' },
          { participantId: 4, summonerName: 'Player4', championId: 'Azir', role: 'mid' },
          { participantId: 5, summonerName: 'Player5', championId: 'Gnar', role: 'top' }
        ]
      },
      redTeamMetadata: {
        participantMetadata: [
          { participantId: 6, summonerName: 'Enemy1', championId: 'Ashe', role: 'bot' },
          { participantId: 7, summonerName: 'Enemy2', championId: 'Leona', role: 'support' },
          { participantId: 8, summonerName: 'Enemy3', championId: 'Hecarim', role: 'jungle' },
          { participantId: 9, summonerName: 'Enemy4', championId: 'Syndra', role: 'mid' },
          { participantId: 10, summonerName: 'Enemy5', championId: 'Ornn', role: 'top' }
        ]
      }
    }
  };

  const demoGameDetails = {
    frames: [{
      participants: [
        { participantId: 1, kills: 3, deaths: 1, assists: 5, totalGoldEarned: 8500, level: 12, creepScore: 145, items: [3031, 1018, 3006, 3046, 0, 0] },
        { participantId: 2, kills: 0, deaths: 2, assists: 8, totalGoldEarned: 5200, level: 10, creepScore: 25, items: [3190, 1001, 3117, 2055, 0, 0] },
        { participantId: 3, kills: 4, deaths: 0, assists: 3, totalGoldEarned: 7800, level: 11, creepScore: 98, items: [1400, 3134, 3006, 1037, 0, 0] },
        { participantId: 4, kills: 2, deaths: 1, assists: 4, totalGoldEarned: 7200, level: 11, creepScore: 112, items: [3020, 1052, 3145, 1058, 0, 0] },
        { participantId: 5, kills: 1, deaths: 2, assists: 6, totalGoldEarned: 6900, level: 10, creepScore: 89, items: [3068, 1029, 3047, 1028, 0, 0] },
        { participantId: 6, kills: 2, deaths: 3, assists: 2, totalGoldEarned: 6800, level: 10, creepScore: 128, items: [3031, 1038, 1042, 3006, 0, 0] },
        { participantId: 7, kills: 1, deaths: 1, assists: 4, totalGoldEarned: 4900, level: 9, creepScore: 18, items: [3190, 1001, 3117, 2055, 0, 0] },
        { participantId: 8, kills: 1, deaths: 4, assists: 4, totalGoldEarned: 5800, level: 9, creepScore: 82, items: [1400, 3134, 1011, 1029, 0, 0] },
        { participantId: 9, kills: 2, deaths: 2, assists: 3, totalGoldEarned: 6400, level: 10, creepScore: 95, items: [3020, 1052, 3145, 1026, 0, 0] },
        { participantId: 10, kills: 0, deaths: 1, assists: 5, totalGoldEarned: 5900, level: 9, creepScore: 78, items: [3068, 1029, 3047, 1028, 0, 0] }
      ]
    }]
  };

  const demoCurrentGame = { number: 2 };

  return (
    <div className="bg-riot-gray/50 rounded-lg border border-gray-600 overflow-hidden hover:border-riot-blue/50 transition-colors">
      {/* Match Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${stateInfo.color}`}>
              {match.state === 'inProgress' && '🔴'} {stateInfo.text}
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
              <div className="text-xs">{match.strategy.type} of {match.strategy.count}</div>
            )}
          </div>
        </div>

        {/* League Info */}
        {league && (
          <div className="flex items-center space-x-2 mt-2">
            {(league.image || getLeagueIcon(league.name)) ? (
              <img 
                src={league.image || getLeagueIcon(league.name)} 
                alt={league.name} 
                className="w-5 h-5 rounded"
                onError={(e) => { 
                  const fallback = getLeagueIcon(league.name);
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
            <span className="text-sm text-gray-300">{league.name}</span>
            {flags.includes('hasVod') && (
              <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">
                📺 VOD Available
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
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded hover:bg-green-800/30 transition-colors"
              >
                {showDemo ? 'Hide Demo Stats' : 'Show Demo Stats'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {streams.slice(0, ESPORTS_CONFIG.MAX_VISIBLE_STREAMS).map((stream: any, index: number) => (
                <span 
                  key={index}
                  className="text-xs bg-purple-900/20 text-purple-300 px-2 py-1 rounded border border-purple-500/20"
                  title={`${stream.mediaLocale.englishName} - ${stream.provider}`}
                >
                  {stream.mediaLocale.translatedName}
                </span>
              ))}
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
                <div className="mb-1">🌐 Streaming on Twitch</div>
                <div className="text-xs text-gray-400">
                  Multiple language options available
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {match.teams?.map((team, index) => (
              <div key={team.id || index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={team.image}
                    alt={team.name}
                    className="w-8 h-8 rounded-full border border-gray-500"
                    onError={(e) => {
                      e.currentTarget.src = '/default-team-logo.png';
                    }}
                  />
                  <div>
                    <div className="font-medium text-white">{team.name}</div>
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
            )) || (
              <div className="text-center text-gray-400 py-4">
                <div className="text-sm">Teams information not available</div>
              </div>
            )}
            
            {/* Match Stats Footer for matches */}
            {match.teams && match.strategy && (
              <div className="pt-3 mt-3 border-t border-gray-600">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{match.strategy.type} {match.strategy.count}</span>
                  {flags.length > 0 && (
                    <div className="flex space-x-2">
                      {flags.includes('hasVod') && <span>📺</span>}
                      {flags.includes('isSpoiler') && <span>⚠️</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Live Game Stats */}
        {(liveGameStats && currentGame) || showDemo ? (
          <LiveGameStats 
            gameStats={showDemo ? demoGameStats : liveGameStats} 
            gameDetails={showDemo ? demoGameDetails : rawMatch.liveGameDetails}
            currentGame={showDemo ? demoCurrentGame : currentGame} 
          />
        ) : null}
      </div>
    </div>
  );
};

export default LiveMatchCard;