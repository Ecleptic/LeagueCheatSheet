'use client';

import React from 'react';
import { Standing } from '@/lib/esports/api';

interface StandingsTableProps {
  standings: Standing[];
  leagueName?: string;
}

const StandingsTable: React.FC<StandingsTableProps> = ({ standings, leagueName }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-riot-gray/30 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-white mb-2">No Standings Available</h3>
        <p className="text-gray-400 text-sm">
          {leagueName ? `No standings data available for ${leagueName}` : 'No tournament standings available at this time'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-riot-gray/50 rounded-lg border border-gray-600 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-600 bg-riot-gray/30">
        <h3 className="text-lg font-semibold text-white">
          {leagueName || 'Tournament'} Standings
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-riot-gray/20 border-b border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                W-L
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Win %
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Games
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                +/-
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {standings.map((team, index) => {
              const winRate = team.wins + team.losses > 0 ? (team.wins / (team.wins + team.losses) * 100) : 0;
              const gameDiff = team.gameWins - team.gameLosses;
              
              return (
                <tr 
                  key={team.teamId || index} 
                  className="hover:bg-riot-gray/20 transition-colors"
                >
                  {/* Position */}
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${
                      index < 3 ? 'text-green-400' : 
                      index < standings.length - 3 ? 'text-white' : 'text-red-400'
                    }`}>
                      {team.rank || index + 1}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full border border-gray-500 bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-300 font-bold">
                          {team.teamName.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {team.teamName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {team.teamSlug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Win-Loss */}
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-white font-medium">
                      {team.wins}-{team.losses}
                    </div>
                  </td>

                  {/* Win Percentage */}
                  <td className="px-6 py-4 text-center">
                    <div className={`text-sm font-medium ${
                      winRate >= 70 ? 'text-green-400' : 
                      winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {winRate.toFixed(0)}%
                    </div>
                  </td>

                  {/* Game Record */}
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-300">
                      {team.gameWins}-{team.gameLosses}
                    </div>
                  </td>

                  {/* Game Differential */}
                  <td className="px-6 py-4 text-center">
                    <div className={`text-sm font-medium ${
                      gameDiff > 0 ? 'text-green-400' : 
                      gameDiff < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {gameDiff > 0 ? '+' : ''}{gameDiff}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-600 bg-riot-gray/20">
        <div className="flex justify-between text-xs text-gray-400">
          <div className="space-x-4">
            <span><span className="text-green-400">●</span> Playoff Position</span>
            <span><span className="text-red-400">●</span> Elimination Zone</span>
          </div>
          <div>
            W-L: Series Record | Games: Individual Game Record | +/-: Game Differential
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;