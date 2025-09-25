'use client';

import React from 'react';
import { Match } from '@/lib/esports/api';

interface ScheduleMatchCardProps {
  match: Match;
}

const ScheduleMatchCard: React.FC<ScheduleMatchCardProps> = ({ match }) => {
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
    const diffMs = date.getTime() - now.getTime();
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
    if (diffMs < 0) {
      relativeTime = 'Started';
    } else if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      relativeTime = `in ${diffMins}m`;
    } else if (diffHours < 24) {
      relativeTime = `in ${diffHours}h`;
    } else if (diffDays < 7) {
      relativeTime = `in ${diffDays}d`;
    } else {
      relativeTime = date.toLocaleDateString();
    }

    return { timeStr, relativeTime, date };
  };

  const timeInfo = formatMatchTime(match.startTime);
  
  // Extract additional data
  const rawMatch = match as any;
  const league = rawMatch.league;
  const flags = rawMatch.match?.flags || [];

  return (
    <div className="bg-riot-gray/50 rounded-lg border border-gray-600 overflow-hidden hover:border-riot-blue/50 transition-colors">
      {/* Match Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-white font-medium">{timeInfo.timeStr}</div>
            <div className="text-xs text-gray-400">{timeInfo.relativeTime}</div>
          </div>
          <div className="text-right text-sm text-gray-400">
            <div className="font-medium">{match.blockName}</div>
            {match.strategy && (
              <div className="text-xs">{match.strategy.type} of {match.strategy.count}</div>
            )}
          </div>
        </div>

        {/* League Info and Match Details */}
        {league && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
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
            </div>
            <div className="flex items-center space-x-2">
              {flags.includes('hasVod') && (
                <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">
                  📺 VOD
                </span>
              )}
              {flags.includes('isSpoiler') && (
                <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-0.5 rounded">
                  ⚠️ Spoiler
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="space-y-3">
          {match.teams?.map((team, index) => (
            <div key={team.id || `team-${index}`} className="flex items-center justify-between">
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
                {team.record && (
                  <div className="text-xs text-gray-400">
                    Season: {team.record.wins}W-{team.record.losses}L
                  </div>
                )}
                {team.result?.gameWins !== undefined && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Series: {team.result.gameWins} wins
                  </div>
                )}
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-400 py-4">
              <div className="text-sm">Teams information not available</div>
            </div>
          )}

          {/* Match Format Info */}
          {match.strategy && match.teams && match.teams.length > 0 && (
            <div className="pt-3 mt-3 border-t border-gray-600">
              <div className="flex justify-center text-xs text-gray-400">
                <span className="bg-gray-700/50 px-3 py-1 rounded-full">
                  {match.strategy.type} of {match.strategy.count} Series
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleMatchCard;