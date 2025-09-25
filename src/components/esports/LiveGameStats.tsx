'use client';

import React, { useState, useEffect } from 'react';
import { riotApi } from '@/lib/riot-api';

interface LiveGameStatsProps {
  gameStats: any;
  gameDetails: any;
  currentGame: any;
}

const ChampionIcon: React.FC<{ championName: string; className?: string }> = ({ championName, className }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChampionImage = async () => {
      try {
        // Use the correct format that matches Data Dragon: championId.png
        const championImageFull = `${championName}.png`;
        const url = await riotApi.getChampionImageUrl(championImageFull);
        setImageUrl(url);
      } catch (error) {
        console.warn(`Failed to load champion image for ${championName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (championName) {
      loadChampionImage();
    }
  }, [championName]);

  if (loading) {
    return <div className={`bg-gray-600 animate-pulse rounded ${className}`} />;
  }

  if (!imageUrl) {
    return (
      <div className={`bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400 ${className}`}>
        {championName.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={championName}
      className={`rounded ${className}`}
    />
  );
};

const ItemIcon: React.FC<{ itemId: number; className?: string }> = ({ itemId, className }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const loadItemImage = async () => {
      try {
        const url = await riotApi.getItemImageUrl(`${itemId}.png`);
        setImageUrl(url);
      } catch (error) {
        console.warn(`Failed to load item image for ${itemId}`);
      }
    };

    if (itemId > 0) {
      loadItemImage();
    }
  }, [itemId]);

  if (itemId === 0) {
    return <div className={`bg-gray-800 border border-gray-600 rounded ${className}`} />;
  }

  if (!imageUrl) {
    return <div className={`bg-gray-700 animate-pulse rounded ${className}`} />;
  }

  return (
    <img
      src={imageUrl}
      alt={`Item ${itemId}`}
      className={`rounded border border-gray-500 ${className}`}
    />
  );
};

const LiveGameStats: React.FC<LiveGameStatsProps> = ({ gameStats, gameDetails, currentGame }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!gameStats?.gameMetadata) {
    return null;
  }

  const { blueTeamMetadata, redTeamMetadata } = gameStats.gameMetadata;
  const latestFrame = gameDetails?.frames?.[gameDetails.frames.length - 1];
  const participants = latestFrame?.participants || [];

  // Calculate team totals
  const blueTeamStats = participants.slice(0, 5).reduce((acc: any, p: any) => ({
    kills: acc.kills + (p.kills || 0),
    gold: acc.gold + (p.totalGoldEarned || 0)
  }), { kills: 0, gold: 0 });

  const redTeamStats = participants.slice(5, 10).reduce((acc: any, p: any) => ({
    kills: acc.kills + (p.kills || 0),
    gold: acc.gold + (p.totalGoldEarned || 0)
  }), { kills: 0, gold: 0 });

  const goldLead = blueTeamStats.gold - redTeamStats.gold;

  const PlayerRow: React.FC<{ 
    participant: any, 
    playerMeta: any, 
    teamColor: string,
    isDetailed?: boolean 
  }> = ({ participant, playerMeta, teamColor, isDetailed = false }) => {
    const stats = participants.find((p: any) => p.participantId === participant.participantId) || {};
    
    return (
      <div className="flex items-center space-x-2 py-1">
        <div className="w-6 h-6">
          <ChampionIcon championName={participant.championId} className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white truncate font-medium">
            {participant.summonerName}
          </div>
          {isDetailed && (
            <div className="text-xs text-gray-400 capitalize">
              {participant.role} • Lv{stats.level || 1}
            </div>
          )}
        </div>

        <div className="text-right text-xs">
          {isDetailed ? (
            <div className="space-y-0.5">
              <div className="text-white">
                {stats.kills || 0}/{stats.deaths || 0}/{stats.assists || 0}
              </div>
              <div className="text-gray-400">
                {Math.floor((stats.totalGoldEarned || 0) / 1000)}k • {stats.creepScore || 0} CS
              </div>
            </div>
          ) : (
            <div className="text-white">
              {stats.kills || 0}/{stats.deaths || 0}/{stats.assists || 0}
            </div>
          )}
        </div>

        {isDetailed && stats.items && (
          <div className="flex space-x-0.5 ml-2">
            {[0, 1, 2, 3, 4, 5].map((slot) => (
              <ItemIcon
                key={slot}
                itemId={stats.items[slot] || 0}
                className="w-4 h-4"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const TeamSection: React.FC<{ team: any, teamColor: string, teamStats: any }> = ({ 
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
        {team.participantMetadata?.map((participant: any) => (
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
          <div className="text-xs text-gray-400">LIVE GAME {currentGame.number}</div>
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
          team={blueTeamMetadata} 
          teamColor="blue" 
          teamStats={blueTeamStats}
        />
        <TeamSection 
          team={redTeamMetadata} 
          teamColor="red" 
          teamStats={redTeamStats}
        />
      </div>
      
      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-700 text-center">
        <div className="text-xs text-gray-500 space-x-4">
          <span>Patch {gameStats.gameMetadata.patchVersion}</span>
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