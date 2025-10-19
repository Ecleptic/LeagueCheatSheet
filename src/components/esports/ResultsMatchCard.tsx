'use client';

import React from 'react';
import { guessTeamLogo } from '@/lib/esports/teamLogos';
import Image from 'next/image';
import { Match } from '@/lib/esports/api';
import TwitchIcon from '@/components/icons/TwitchIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';

interface ResultsMatchCardProps {
  match: Match;
}

interface ExtendedMatch extends Match {
  league?: {
    name?: string;
    image?: string;
  };
  match?: {
    flags?: string[];
  };
}

const ResultsMatchCard: React.FC<ResultsMatchCardProps> = ({ match }) => {
  // Helper function to format strategy type (bestOf -> Best of)
  const formatStrategyType = (type: string): string => {
    if (type === 'bestOf') return 'Best of';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // League icon fallback system
  const getLeagueIcon = (leagueName: string) => {
    const name = leagueName.toLowerCase();
    
    // Map common league names to their official logos
    const leagueIcons: { [key: string]: string } = {
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
    
    // Try exact match first
    if (leagueIcons[name]) {
      return leagueIcons[name];
    }
    
    // Try partial matches for variants
    for (const [key, icon] of Object.entries(leagueIcons)) {
      if (name.includes(key) || key.includes(name.split(' ')[0])) {
        return icon;
      }
    }
    
    return null;
  };

  const formatMatchTime = (startTime: string) => {
    const date = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    // Format time
    const timeStr = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Format relative time
    let relativeTime = '';
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      relativeTime = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      relativeTime = `${diffDays}d ago`;
    } else {
      relativeTime = date.toLocaleDateString();
    }

    return { timeStr, relativeTime, date };
  };

  const timeInfo = formatMatchTime(match.startTime);
  
  // Extract additional data
  const rawMatch = match as ExtendedMatch;
  const league = rawMatch.league;
  const flags = rawMatch.match?.flags || [];

  return (
    <div className="bg-riot-gray/50 rounded-lg border border-gray-600 overflow-hidden hover:border-riot-blue/50 transition-colors">
      {/* Match Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-900/30 text-green-300">
              ✅ COMPLETED
            </span>
          </div>
          <div className="text-right text-sm text-gray-400">
            <div className="font-medium">{match.blockName}</div>
            <div className="text-xs">{timeInfo.relativeTime}</div>
          </div>
        </div>

        {/* League Info */}
        {league && league.name && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
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
                    {league.name?.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-300">{league.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {flags.includes('hasVod') && (
                <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <TwitchIcon className="w-4 h-4" />
                  VOD
                </span>
              )}
              {match.strategy && (
                <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">
                  {formatStrategyType(match.strategy.type)} {match.strategy.count}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Teams and Results */}
      <div className="p-4">
        {match.teams && match.teams.length > 0 ? (
          <div className="space-y-3">
            {match.teams.map((team, index) => (
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
                    <div className="font-medium text-white">{team.name}</div>
                    <div className="text-xs text-gray-400">{team.code}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  {team.result ? (
                    <div className="flex items-center space-x-3">
                      <div className={`text-2xl font-bold ${
                        team.result.outcome === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {team.result.gameWins}
                      </div>
                      {team.result.outcome === 'win' && (
                        <div className="text-lg">
                          👑
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">N/A</div>
                  )}
                  {team.record && (
                    <div className="text-xs text-gray-400 mt-1">
                      Season: {team.record.wins}W-{team.record.losses}L
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Match Summary */}
            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{timeInfo.timeStr}</span>
                <span>{match.strategy?.type} of {match.strategy?.count}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            <div className="text-sm">Match details not available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsMatchCard;