'use client';

import React, { useState } from 'react';
import ChampionImage from '@/components/ui/ChampionImage';
import ItemImage from '@/components/ui/ItemImage';

// Basic types for live game data (external API structure may vary)
interface LiveGameStats {
  frames?: Array<{
    participants?: Record<string, {
      championStats?: Record<string, unknown>;
      participantId?: number;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface LiveGameDetails {
  esportsGame?: {
    players?: Array<{
      championName?: string;
      summonerName?: string;
      teamName?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define interfaces for participant and team data
interface ParticipantMetadata {
  participantId: number;
  summonerName: string;
  championId: number;
  role: string;
  gameVersion?: string;
}

interface ParticipantStats {
  participantId: number;
  level?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  totalGoldEarned?: number;
  creepScore?: number;
  items?: number[];
}

interface TeamData {
  participantMetadata?: ParticipantMetadata[];
}

interface TeamStats {
  kills: number;
  gold: number;
}

interface CurrentGame {
  id?: string;
  state?: string;
  [key: string]: unknown;
}

interface LiveGameStatsProps {
  gameStats: LiveGameStats;
  gameDetails: LiveGameDetails;
  currentGame: CurrentGame;
}

const LiveGameStats: React.FC<LiveGameStatsProps> = ({ gameStats, gameDetails, currentGame }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!gameStats || typeof gameStats !== 'object') {
    return null;
  }

  // Type assertions for the unknown API structure
  const gameMetadata = (gameStats as { gameMetadata?: Record<string, unknown> }).gameMetadata;
  if (!gameMetadata) {
    return null;
  }

  const blueTeamMetadata = gameMetadata.blueTeamMetadata as TeamData | undefined;
  const redTeamMetadata = gameMetadata.redTeamMetadata as TeamData | undefined;
  
  const frames = (gameDetails as { frames?: unknown[] })?.frames;
  const latestFrame = frames && Array.isArray(frames) ? frames[frames.length - 1] : null;
  const participants = (latestFrame as { participants?: unknown[] })?.participants || [];

  // Calculate team totals
  const blueTeamStats = participants.slice(0, 5).reduce((acc: { kills: number; gold: number }, p: unknown) => {
    const participant = p as { kills?: number; totalGoldEarned?: number };
    return {
      kills: acc.kills + (participant.kills || 0),
      gold: acc.gold + (participant.totalGoldEarned || 0)
    };
  }, { kills: 0, gold: 0 });

  const redTeamStats = participants.slice(5, 10).reduce((acc: { kills: number; gold: number }, p: unknown) => {
    const participant = p as { kills?: number; totalGoldEarned?: number };
    return {
      kills: acc.kills + (participant.kills || 0),
      gold: acc.gold + (participant.totalGoldEarned || 0)
    };
  }, { kills: 0, gold: 0 });

  const goldLead = blueTeamStats.gold - redTeamStats.gold;

  const PlayerRow: React.FC<{ 
    participant: ParticipantMetadata, 
    playerMeta: ParticipantMetadata, 
    teamColor: string,
    isDetailed?: boolean 
  }> = ({ participant, isDetailed = false }) => {
    const stats = participants.find((p: unknown) => (p as ParticipantStats).participantId === participant.participantId) as ParticipantStats | undefined;
    const playerStats: ParticipantStats = stats || {} as ParticipantStats;
    
    return (
      <div className="flex items-center space-x-2 py-1">
        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
          {participant.championId && (
            <ChampionImage
              championImageFull={`${participant.championId}.png`}
              alt={`Champion ${participant.championId}`}
              className="w-6 h-6 rounded overflow-hidden"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white truncate font-medium">
            {participant.summonerName}
          </div>
          {isDetailed && (
            <div className="text-xs text-gray-400 capitalize">
              {participant.role} • Lv{playerStats.level || 1}
            </div>
          )}
        </div>

        <div className="text-right text-xs">
          {isDetailed ? (
            <div className="space-y-0.5">
              <div className="text-white">
                {playerStats.kills || 0}/{playerStats.deaths || 0}/{playerStats.assists || 0}
              </div>
              <div className="text-gray-400">
                {Math.floor((playerStats.totalGoldEarned || 0) / 1000)}k • {playerStats.creepScore || 0} CS
              </div>
            </div>
          ) : (
            <div className="text-white">
              {playerStats.kills || 0}/{playerStats.deaths || 0}/{playerStats.assists || 0}
            </div>
          )}
        </div>

        {isDetailed && playerStats.items && (
          <div className="flex space-x-0.5">
            {[0, 1, 2, 3, 4, 5].map(slot => (
              <div key={slot} className="w-5 h-5">
                <ItemImage
                  itemImageFull={`${playerStats.items?.[slot] || 0}.png`}
                  alt={`Item ${slot + 1}`}
                  className="w-5 h-5"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TeamSection: React.FC<{ team: TeamData, teamColor: string, teamStats: TeamStats }> = ({ 
    team, 
    teamColor, 
    teamStats 
  }) => (
    <div className="space-y-1">
      <div className={`flex items-center justify-between text-xs font-bold ${
        teamColor === 'blue' ? 'text-blue-400' : 'text-red-400'
      }`}>
        <span>{teamColor.toUpperCase()} SIDE</span>
        <span>{teamStats.kills} Kills • {Math.floor(teamStats.gold / 1000)}k Gold</span>
      </div>
      
      <div className="space-y-0.5">
        {team.participantMetadata?.map((participant: ParticipantMetadata) => (
          <PlayerRow
            key={participant.participantId}
            participant={participant}
            playerMeta={participant}
            teamColor={teamColor}
            isDetailed={showDetails}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-3 pt-3 border-t border-gray-600">
      {/* Header */}
      <div className="mb-3 text-center">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="text-xs text-gray-400">LIVE GAME {currentGame?.number ? String(currentGame.number) : ''}</div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded hover:bg-purple-800/30 transition-colors"
          >
            {showDetails ? 'Simple View' : 'Detailed View'}
          </button>
        </div>
        
        {/* Gold Lead Indicator */}
        {participants.length > 0 && (
          <div className="text-xs text-center">
            {goldLead === 0 ? (
              <span className="text-gray-400">Gold Even</span>
            ) : (
              <span className={goldLead > 0 ? 'text-blue-400' : 'text-red-400'}>
                {goldLead > 0 ? 'Blue' : 'Red'} +{Math.abs(Math.floor(goldLead / 1000))}k gold
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Teams */}
      <div className="grid grid-cols-1 gap-4">
        <TeamSection 
          team={blueTeamMetadata || { participantMetadata: [] }} 
          teamColor="blue" 
          teamStats={blueTeamStats}
        />
        <TeamSection 
          team={redTeamMetadata || { participantMetadata: [] }} 
          teamColor="red" 
          teamStats={redTeamStats}
        />
      </div>
      
      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-700 text-center">
        <div className="text-xs text-gray-500 space-x-4">
          <span>Patch {(gameStats as LiveGameStats & { gameMetadata?: { patchVersion?: string } })?.gameMetadata?.patchVersion || 'N/A'}</span>
          {participants.length > 0 && (
            <span>
              {blueTeamStats.kills + redTeamStats.kills} Total Kills
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveGameStats;