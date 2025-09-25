'use client';

import React, { useState } from 'react';
import { useTeamData, useTeamActions } from '../../hooks/useTeamActions';
import PlayerCard from './PlayerCard';

interface TeamPanelProps {
  team: 'blue' | 'red';
}

const TeamPanel: React.FC<TeamPanelProps> = ({ team }) => {
  const teamData = useTeamData(team);
  const { setTeamName } = useTeamActions();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(teamData.name);
  const [allExpanded, setAllExpanded] = useState(false);

  const handleNameSave = () => {
    setTeamName(team, tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(teamData.name);
    setIsEditingName(false);
  };

  const teamColorClass = team === 'blue' 
    ? 'border-lol-blue-accent bg-lol-blue-dark/20 shadow-lol-blue-accent/20 shadow-lg' 
    : 'border-lol-red-accent bg-lol-red-dark/20 shadow-lol-red-accent/20 shadow-lg';

  const headerColorClass = team === 'blue'
    ? 'bg-gradient-to-r from-lol-blue-dark to-lol-blue-main text-white border-b-2 border-lol-blue-accent'
    : 'bg-gradient-to-r from-lol-red-dark to-lol-red-main text-white border-b-2 border-lol-red-accent';

  return (
    <div className={`border-2 rounded-lg ${teamColorClass} overflow-hidden`}>
      {/* Team Header */}
      <div className={`${headerColorClass} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-white/20 border border-white/40 rounded px-2 py-1 text-white placeholder-white/60"
                  placeholder="Team name"
                  maxLength={20}
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700 transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={handleNameCancel}
                  className="px-2 py-1 bg-gray-600 rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{teamData.name}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-white/80 hover:text-white text-sm"
                  title="Edit team name"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
          
          {/* Expand/Collapse All Toggle */}
          <button
            onClick={() => setAllExpanded(!allExpanded)}
            className="text-white/80 hover:text-white text-sm px-2 py-1 rounded border border-white/40 hover:border-white/60 transition-colors"
            title={allExpanded ? "Collapse all players" : "Expand all players"}
          >
            {allExpanded ? "📄 Collapse" : "📋 Expand"}
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="p-4 space-y-4">
        {teamData.players.map((player) => (
          <PlayerCard 
            key={player.id} 
            player={player} 
            team={team}
            forceExpanded={allExpanded}
          />
        ))}
      </div>

      {/* Team Actions */}
      <div className="border-t border-gray-600 p-3 bg-riot-gray/50">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors">
            📋 Analyze Comp
          </button>
          <button className="flex-1 px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors">
            🎯 Suggest Builds
          </button>
          <button className="px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors">
            ⚡ Quick Fill
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamPanel;