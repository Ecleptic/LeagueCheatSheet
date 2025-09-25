'use client';

import React from 'react';
import { useTeam } from '../../contexts/TeamContext';
import TeamPanel from './TeamPanel';

const TeamView: React.FC = () => {
  const { gameState } = useTeam();

  return (
    <div className="min-h-screen bg-riot-dark pb-20">
      {/* Game Info Header */}
      <div className="bg-riot-gray p-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Game Time: <span className="text-riot-gold font-mono">{Math.floor(gameState.gameTime)}:{(gameState.gameTime % 1 * 60).toFixed(0).padStart(2, '0')}</span>
          </div>
          <div className="text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              gameState.phase === 'draft' ? 'bg-lol-blue-main text-white border border-lol-blue-accent' :
              gameState.phase === 'early' ? 'bg-emerald-600 text-white border border-emerald-400' :
              gameState.phase === 'mid' ? 'bg-amber-600 text-white border border-amber-400' :
              'bg-lol-red-main text-white border border-lol-red-accent'
            }`}>
              {gameState.phase.toUpperCase()} GAME
            </span>
          </div>
        </div>
      </div>

      {/* Teams Container */}
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Blue Team */}
        <div className="flex-1">
          <TeamPanel team="blue" />
        </div>

        {/* Red Team */}
        <div className="flex-1">
          <TeamPanel team="red" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2">
        <button 
          className="w-12 h-12 bg-lol-blue-main border border-lol-blue-accent rounded-full flex items-center justify-center text-white shadow-lg hover:bg-lol-blue-dark transition-colors"
          title="Reset Game"
          onClick={() => {
            if (confirm('Reset all team data? This cannot be undone.')) {
              // TODO: Reset game
            }
          }}
        >
          🔄
        </button>
        <button 
          className="w-12 h-12 bg-emerald-600 border border-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-700 transition-colors"
          title="Save Configuration"
          onClick={() => {
            // TODO: Save configuration
          }}
        >
          💾
        </button>
      </div>
    </div>
  );
};

export default TeamView;