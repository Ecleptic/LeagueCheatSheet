/**
 * LiveGameStatsView - Comprehensive live game statistics viewer
 * Cloned from AndyDanger/live-lol-esports with mobile optimization
 * 
 * Features:
 * - Real-time game stats (gold, kills, objectives)
 * - Gold difference chart
 * - Team stats (towers, dragons, barons, inhibitors)
 * - Player stats table (KDA, CS, gold, items)
 * - Responsive design (desktop + mobile)
 * - Item images from Data Dragon
 * - Dragon/objective icons
 */

'use client';

import React, { useState } from 'react';
import { useLiveGameStats } from '@/hooks/useEsports';
import { WindowFrame, TeamStats, WindowParticipant, ParticipantMetadata } from '@/types/esports';
import Image from 'next/image';
import StatsIcon from '@/components/icons/StatsIcon';
import Tower from '@/components/icons/Tower';
import DragonCloud from '@/components/icons/DragonCloud';
import DragonInfernal from '@/components/icons/DragonInfernal';
import DragonMountain from '@/components/icons/DragonMountain';
import DragonOcean from '@/components/icons/DragonOcean';
import DragonHextech from '@/components/icons/DragonHextech';
import DragonChemtech from '@/components/icons/DragonChemtech';
import DragonElder from '@/components/icons/DragonElder';
import Baron from '@/components/icons/Baron';
import Inhibitor from '@/components/icons/Inhibitor';

interface LiveGameStatsViewProps {
  gameId: string | number;
  blueTeamName?: string;
  redTeamName?: string;
  blueTeamLogo?: string;
  redTeamLogo?: string;
}

export function LiveGameStatsView({ 
  gameId, 
  blueTeamName = 'Blue Team',
  redTeamName = 'Red Team',
  blueTeamLogo,
  redTeamLogo
}: LiveGameStatsViewProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'stats' | 'blue' | 'red'>('stats');

  const { 
    latestFrame, 
    firstFrame,
    gameMetadata, 
    detailsData,
    loading, 
    error,
    refetch
  } = useLiveGameStats(gameId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400">Loading live game stats...</p>
          <p className="text-gray-500 text-sm">Connecting to live data feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center max-w-2xl mx-auto">
        <p className="text-red-400 font-semibold text-lg mb-2">⚠️ Error Loading Live Stats</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button 
          onClick={() => refetch?.()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!latestFrame || !gameMetadata) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center max-w-2xl mx-auto">
        <p className="text-gray-400 text-lg mb-2">📊 No Live Game Data Available</p>
        <p className="text-gray-500 text-sm">This game may not have started yet or stats are currently unavailable</p>
        <p className="text-gray-600 text-xs mt-2">Game ID: {gameId}</p>
      </div>
    );
  }

  const { blueTeam, redTeam, gameState, rfc460Timestamp } = latestFrame;
  
  // Calculate game time
  const gameTime = calculateGameTime(firstFrame?.rfc460Timestamp, rfc460Timestamp);
  const stateDisplay = getGameStateDisplay(gameState);

  // Get detailed player data if available
  const latestDetails = detailsData?.frames?.[detailsData.frames.length - 1];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Navigation - Hidden on desktop */}
      <div className="md:hidden bg-gray-900/50 border border-gray-700 rounded-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('stats')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activeSection === 'stats'
                ? 'bg-riot-blue text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <StatsIcon className="w-5 h-5" />
              <span>Stats</span>
            </span>
          </button>
          <button
            onClick={() => setActiveSection('blue')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activeSection === 'blue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
              <span>Blue</span>
            </span>
          </button>
          <button
            onClick={() => setActiveSection('red')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activeSection === 'red'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
              <span>Red</span>
            </span>
          </button>
        </div>
      </div>

      {/* Header with game state and time */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg p-3 md:p-4 gap-3">
        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
          <div className={`px-3 md:px-4 py-2 rounded-lg ${stateDisplay.bgColor} border border-gray-700 flex-shrink-0`}>
            <span className={`font-bold text-sm md:text-base ${stateDisplay.color}`}>
              {stateDisplay.text}
            </span>
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold">
            {gameTime}
          </div>
        </div>
        
        <div className="text-xs md:text-sm text-gray-400 text-center sm:text-right">
          <div>Patch {gameMetadata.patchVersion}</div>
          <div className="text-xs text-gray-500 mt-0.5">Updates every second</div>
        </div>
      </div>

      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block space-y-6">
        <TeamStatsOverview 
          blueTeam={blueTeam}
          redTeam={redTeam}
          blueTeamName={blueTeamName}
          redTeamName={redTeamName}
          blueTeamLogo={blueTeamLogo}
          redTeamLogo={redTeamLogo}
        />
        
        <GoldDifferenceChart blueTeam={blueTeam} redTeam={redTeam} />
        
        <DragonsDisplay blueTeam={blueTeam} redTeam={redTeam} />
        
        <PlayerStatsTable 
          participants={blueTeam.participants}
          metadata={gameMetadata.blueTeamMetadata.participantMetadata}
          teamColor="blue"
          teamName={blueTeamName}
          goldDiffOpponents={redTeam.participants}
          detailedParticipants={latestDetails?.participants}
          patchVersion={gameMetadata.patchVersion}
        />
        
        <PlayerStatsTable 
          participants={redTeam.participants}
          metadata={gameMetadata.redTeamMetadata.participantMetadata}
          teamColor="red"
          teamName={redTeamName}
          goldDiffOpponents={blueTeam.participants}
          detailedParticipants={latestDetails?.participants}
          patchVersion={gameMetadata.patchVersion}
        />
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {activeSection === 'stats' && (
          <>
            <TeamStatsOverview 
              blueTeam={blueTeam}
              redTeam={redTeam}
              blueTeamName={blueTeamName}
              redTeamName={redTeamName}
              blueTeamLogo={blueTeamLogo}
              redTeamLogo={redTeamLogo}
            />
            <GoldDifferenceChart blueTeam={blueTeam} redTeam={redTeam} />
            <DragonsDisplay blueTeam={blueTeam} redTeam={redTeam} />
          </>
        )}
        
        {activeSection === 'blue' && (
          <PlayerStatsTable 
            participants={blueTeam.participants}
            metadata={gameMetadata.blueTeamMetadata.participantMetadata}
            teamColor="blue"
            teamName={blueTeamName}
            goldDiffOpponents={redTeam.participants}
            detailedParticipants={latestDetails?.participants}
            patchVersion={gameMetadata.patchVersion}
            isMobile
          />
        )}
        
        {activeSection === 'red' && (
          <PlayerStatsTable 
            participants={redTeam.participants}
            metadata={gameMetadata.redTeamMetadata.participantMetadata}
            teamColor="red"
            teamName={redTeamName}
            goldDiffOpponents={blueTeam.participants}
            detailedParticipants={latestDetails?.participants}
            patchVersion={gameMetadata.patchVersion}
            isMobile
          />
        )}
      </div>

      {/* Auto-update indicator */}
      <div className="text-center text-xs text-gray-500">
        Last update: {new Date(rfc460Timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

// Helper Components

interface TeamStatsOverviewProps {
  blueTeam: TeamStats;
  redTeam: TeamStats;
  blueTeamName: string;
  redTeamName: string;
  blueTeamLogo?: string;
  redTeamLogo?: string;
}

function TeamStatsOverview({ blueTeam, redTeam, blueTeamName, redTeamName, blueTeamLogo, redTeamLogo }: TeamStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <TeamStatsCard 
        team={blueTeam} 
        teamName={blueTeamName} 
        teamColor="blue"
        teamLogo={blueTeamLogo}
      />
      <TeamStatsCard 
        team={redTeam} 
        teamName={redTeamName} 
        teamColor="red"
        teamLogo={redTeamLogo}
      />
    </div>
  );
}

interface TeamStatsCardProps {
  team: TeamStats;
  teamName: string;
  teamColor: 'blue' | 'red';
  teamLogo?: string;
}

function TeamStatsCard({ team, teamName, teamColor, teamLogo }: TeamStatsCardProps) {
  const bgGradient = teamColor === 'blue' 
    ? 'from-blue-900/30 to-blue-800/20' 
    : 'from-red-900/30 to-red-800/20';
  const borderColor = teamColor === 'blue' ? 'border-blue-700/50' : 'border-red-700/50';

  return (
    <div className={`bg-gradient-to-r ${bgGradient} border ${borderColor} rounded-lg p-3 md:p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {teamLogo && (
            <Image 
              src={teamLogo} 
              alt={teamName}
              width={32}
              height={32}
              className="rounded"
            />
          )}
          <h3 className="font-semibold text-base md:text-lg text-white">{teamName}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-sm">
        <StatItem icon={<StatsIcon className="w-5 h-5" />} label="Kills" value={team.totalKills} />
        <StatItem icon={<span className="text-lg">💰</span>} label="Gold" value={`${(team.totalGold / 1000).toFixed(1)}k`} />
        <StatItem icon={<Tower className="w-5 h-5" />} label="Towers" value={team.towers} />
        <StatItem icon={<DragonCloud className="w-5 h-5" />} label="Dragons" value={team.dragons.length} />
        <StatItem icon={<Baron className="w-5 h-5" />} label="Barons" value={team.barons} />
        <StatItem icon={<Inhibitor className="w-5 h-5" />} label="Inhibs" value={team.inhibitors} />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-gray-900/30 rounded p-2 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-white">{value}</div>
    </div>
  );
}

function GoldDifferenceChart({ blueTeam, redTeam }: { blueTeam: TeamStats; redTeam: TeamStats }) {
  const totalGold = blueTeam.totalGold + redTeam.totalGold;
  const bluePercentage = totalGold > 0 ? (blueTeam.totalGold / totalGold) * 100 : 50;
  const redPercentage = 100 - bluePercentage;
  
  const goldDiff = blueTeam.totalGold - redTeam.totalGold;
  const goldDiffDisplay = Math.abs(goldDiff);
  const leadingTeam = goldDiff > 0 ? 'Blue' : goldDiff < 0 ? 'Red' : 'Even';

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 md:p-6">
      <h3 className="text-sm md:text-base font-semibold text-white mb-3 md:mb-4 text-center">Gold Difference</h3>
      <div className="space-y-2">
        {/* Gold amounts */}
        <div className="flex items-center justify-between text-xs md:text-sm px-2">
          <span className="text-blue-400 font-semibold">
            {(blueTeam.totalGold / 1000).toFixed(1)}k
          </span>
          
          <div className="text-center">
            {leadingTeam !== 'Even' && (
              <span className={`font-semibold text-sm md:text-base ${
                leadingTeam === 'Blue' ? 'text-blue-400' : 'text-red-400'
              }`}>
                +{(goldDiffDisplay / 1000).toFixed(1)}k
              </span>
            )}
          </div>

          <span className="text-red-400 font-semibold">
            {(redTeam.totalGold / 1000).toFixed(1)}k
          </span>
        </div>

        {/* Visual bar */}
        <div className="relative w-full h-5 md:h-6 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-1000 ease-out"
            style={{ width: `${bluePercentage}%` }}
          />
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-500 transition-all duration-1000 ease-out"
            style={{ width: `${redPercentage}%` }}
          />
          
          {/* Center line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-600 transform -translate-x-1/2" />
        </div>

        {/* Percentages */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-2">
          <span>{bluePercentage.toFixed(1)}%</span>
          <span className="text-gray-500">GOLD</span>
          <span>{redPercentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function DragonsDisplay({ blueTeam, redTeam }: { blueTeam: TeamStats; redTeam: TeamStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 md:p-4">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">Blue Dragons</h3>
        <div className="flex gap-2 flex-wrap">
          {blueTeam.dragons.length > 0 ? (
            blueTeam.dragons.map((dragon, i) => (
              <span key={i} className="px-2 py-1 bg-blue-800/30 rounded text-xs md:text-sm flex items-center gap-2">
                {renderDragonIcon(dragon)}
                <span>{dragon}</span>
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs md:text-sm">None</span>
          )}
        </div>
      </div>
      
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 md:p-4">
        <h3 className="text-sm font-semibold text-red-400 mb-2">Red Dragons</h3>
        <div className="flex gap-2 flex-wrap md:justify-end">
          {redTeam.dragons.length > 0 ? (
            redTeam.dragons.map((dragon, i) => (
              <span key={i} className="px-2 py-1 bg-red-800/30 rounded text-xs md:text-sm flex items-center gap-2 justify-end">
                <span>{dragon}</span>
                {renderDragonIcon(dragon)}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs md:text-sm">None</span>
          )}
        </div>
      </div>
    </div>
  );
}

function renderDragonIcon(dragonType: string) {
  const t = dragonType.toLowerCase();
  if (t.includes('infernal')) return <DragonInfernal className="w-4 h-4" />;
  if (t.includes('cloud')) return <DragonCloud className="w-4 h-4" />;
  if (t.includes('ocean')) return <DragonOcean className="w-4 h-4" />;
  if (t.includes('mountain')) return <DragonMountain className="w-4 h-4" />;
  if (t.includes('chemtech')) return <DragonChemtech className="w-4 h-4" />;
  if (t.includes('hextech')) return <DragonHextech className="w-4 h-4" />;
  if (t.includes('elder')) return <DragonElder className="w-4 h-4" />;
  return <DragonCloud className="w-4 h-4" />;
}

interface PlayerStatsTableProps {
  participants: WindowParticipant[];
  metadata: ParticipantMetadata[];
  teamColor: 'blue' | 'red';
  teamName: string;
  goldDiffOpponents?: WindowParticipant[];
  detailedParticipants?: any[];
  patchVersion: string;
  isMobile?: boolean;
}

function PlayerStatsTable({ 
  participants, 
  metadata, 
  teamColor,
  teamName,
  goldDiffOpponents,
  detailedParticipants,
  patchVersion,
  isMobile
}: PlayerStatsTableProps) {
  const getChampionImageUrl = (championId: string) => {
    return `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${championId}.png`;
  };

  const getItemImageUrl = (itemId: number) => {
    return `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${itemId}.png`;
  };

  const getRoleIcon = (role: string): JSX.Element => {
    const roleIcons: Record<string, JSX.Element> = {
      'top': <span className="text-xl">⬆️</span>,
      'jungle': <span className="text-xl">🌳</span>,
      'mid': <span className="text-xl">⚡</span>,
      'bottom': <span className="text-xl">🎯</span>,
      'support': <span className="text-xl">🛡️</span>,
    };
    return roleIcons[role.toLowerCase()] || <span className="text-xl">❓</span>;
  };

  const calculateGoldDiff = (player: WindowParticipant, opponent?: WindowParticipant) => {
    if (!opponent) return 0;
    return player.totalGold - opponent.totalGold;
  };

  const getPlayerItems = (participantId: number) => {
    if (!detailedParticipants) return [];
    const detailed = detailedParticipants.find(p => p.participantId === participantId);
    return detailed?.items || [];
  };

  const headerBg = teamColor === 'blue' ? 'bg-blue-900/30' : 'bg-red-900/30';
  const borderColor = teamColor === 'blue' ? 'border-blue-700/50' : 'border-red-700/50';

  return (
    <div className={`bg-gray-900/50 border ${borderColor} rounded-lg overflow-hidden`}>
      <div className={`${headerBg} px-3 md:px-4 py-2 border-b ${borderColor}`}>
        <h3 className={`font-bold text-sm md:text-base ${teamColor === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
          {teamName} Players
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className={`${headerBg} border-b border-gray-700`}>
              <th className="px-2 md:px-4 py-2 text-left font-semibold">Player</th>
              {!isMobile && <th className="px-2 md:px-3 py-2 text-center font-semibold">HP</th>}
              <th className="px-1 md:px-3 py-2 text-center font-semibold">K</th>
              <th className="px-1 md:px-3 py-2 text-center font-semibold">D</th>
              <th className="px-1 md:px-3 py-2 text-center font-semibold">A</th>
              <th className="px-1 md:px-3 py-2 text-center font-semibold">CS</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold">Gold</th>
              {!isMobile && <th className="px-2 md:px-3 py-2 text-center font-semibold">Diff</th>}
              {!isMobile && <th className="px-2 md:px-3 py-2 text-center font-semibold">Items</th>}
            </tr>
          </thead>
          <tbody>
            {participants.map((player, index) => {
              const meta = metadata[index];
              const opponent = goldDiffOpponents?.[index];
              const goldDiff = calculateGoldDiff(player, opponent);
              const healthPercent = (player.currentHealth / player.maxHealth) * 100;
              const items = getPlayerItems(player.participantId);

              return (
                <tr 
                  key={player.participantId}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  {/* Player & Champion */}
                  <td className="px-2 md:px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={getChampionImageUrl(meta?.championId || 'Aatrox')}
                          alt={meta?.championId}
                          width={isMobile ? 32 : 40}
                          height={isMobile ? 32 : 40}
                          className="rounded"
                          unoptimized
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gray-900 border border-gray-700 rounded px-1 text-xs font-bold">
                          {player.level}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-white truncate text-xs md:text-sm">{meta?.summonerName || 'Unknown'}</span>
                        <span className="text-xs text-gray-400 truncate">
                          {getRoleIcon(meta?.role || '')} {meta?.championId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Health Bar - Desktop only */}
                  {!isMobile && (
                    <td className="px-2 md:px-3 py-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 md:w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-500"
                            style={{ width: `${Math.max(0, Math.min(100, healthPercent))}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 hidden md:inline">
                          {player.currentHealth}/{player.maxHealth}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* K/D/A */}
                  <td className="px-1 md:px-3 py-2 text-center font-semibold text-green-400">
                    {player.kills}
                  </td>
                  <td className="px-1 md:px-3 py-2 text-center font-semibold text-red-400">
                    {player.deaths}
                  </td>
                  <td className="px-1 md:px-3 py-2 text-center font-semibold text-gray-300">
                    {player.assists}
                  </td>

                  {/* CS */}
                  <td className="px-1 md:px-3 py-2 text-center font-semibold">
                    {player.creepScore}
                  </td>

                  {/* Gold */}
                  <td className="px-2 md:px-3 py-2 text-center font-semibold text-yellow-400">
                    {(player.totalGold / 1000).toFixed(1)}k
                  </td>

                  {/* Gold Diff - Desktop only */}
                  {!isMobile && (
                    <td className="px-2 md:px-3 py-2 text-center font-semibold">
                      {goldDiff !== 0 && (
                        <span className={goldDiff > 0 ? 'text-green-400' : 'text-red-400'}>
                          {goldDiff > 0 ? '+' : ''}{(goldDiff / 1000).toFixed(1)}k
                        </span>
                      )}
                      {goldDiff === 0 && <span className="text-gray-500">-</span>}
                    </td>
                  )}

                  {/* Items - Desktop only */}
                  {!isMobile && (
                    <td className="px-2 md:px-3 py-2">
                      <div className="flex gap-0.5 justify-center">
                        {items.slice(0, 6).map((itemId: number, i: number) => (
                          itemId > 0 ? (
                            <Image
                              key={i}
                              src={getItemImageUrl(itemId)}
                              alt={`Item ${itemId}`}
                              width={24}
                              height={24}
                              className="rounded border border-gray-700"
                              unoptimized
                            />
                          ) : (
                            <div key={i} className="w-6 h-6 bg-gray-800 rounded border border-gray-700" />
                          )
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper functions

function calculateGameTime(startTime?: string, currentTime?: string): string {
  if (!startTime || !currentTime) return '00:00';
  try {
    const start = new Date(startTime).getTime();
    const current = new Date(currentTime).getTime();
    const diffMs = current - start;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } catch {
    return '00:00';
  }
}

function getGameStateDisplay(gameState: 'in_game' | 'paused' | 'finished') {
  switch (gameState) {
    case 'in_game':
      return { text: 'LIVE', color: 'text-green-400', bgColor: 'bg-green-900/30' };
    case 'paused':
      return { text: 'PAUSED', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' };
    case 'finished':
      return { text: 'FINISHED', color: 'text-gray-400', bgColor: 'bg-gray-900/30' };
    default:
      return { text: 'UNKNOWN', color: 'text-gray-400', bgColor: 'bg-gray-900/30' };
  }
}
