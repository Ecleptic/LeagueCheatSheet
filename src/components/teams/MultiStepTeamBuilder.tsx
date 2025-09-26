'use client';

import React, { useState, useEffect } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { TeamBuilderStep, Position, createDefaultTeamBuilderState, TeamBuilderState } from '@/types/team';
import PositionIcon, { getAllPositions } from '@/components/PositionIcon';
import { ChampionSummary } from '@/types/champion';
import ChampionImage from '@/components/ui/ChampionImage';
import { SummonerSpell } from '@/types/summonerSpell';
import SummonerSpellImage from '@/components/ui/SummonerSpellImage';
import ChampionSelector from './ChampionSelector';
import SummonerSpellSelector from './SummonerSpellSelector';
import SummonerSpellModal from '@/components/modals/SummonerSpellModal';

interface MultiStepTeamBuilderProps {
  className?: string;
}

export default function MultiStepTeamBuilder({ className = '' }: MultiStepTeamBuilderProps) {
  const { gameState, dispatch } = useTeam();
  const [builderState, setBuilderState] = useState<TeamBuilderState>(createDefaultTeamBuilderState());
  
  // Team names step - Start with empty names for the builder, ensure they stay synchronized
  const [blueTeamName, setBlueTeamName] = useState('');
  const [redTeamName, setRedTeamName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize team names from gameState if they exist, otherwise keep empty
  useEffect(() => {
    // Only sync if gameState has actual content (not default empty state)
    if (gameState.blueTeam.name && gameState.blueTeam.name !== '') {
      setBlueTeamName(gameState.blueTeam.name);
    }
    if (gameState.redTeam.name && gameState.redTeam.name !== '') {
      setRedTeamName(gameState.redTeam.name);
    }
    setIsInitialized(true);
  }, [gameState.blueTeam.name, gameState.redTeam.name]);

  // Modal states for champion and summoner spell selection
  const [championModal, setChampionModal] = useState<{
    isOpen: boolean;
    team: 'blue' | 'red';
    playerId: string;
    playerName: string;
  }>({
    isOpen: false,
    team: 'blue',
    playerId: '',
    playerName: ''
  });

  const [summonerSpellModal, setSummonerSpellModal] = useState<{
    isOpen: boolean;
    team: 'blue' | 'red';
    playerId: string;
    playerName: string;
    spellSlot: 0 | 1;
  }>({
    isOpen: false,
    team: 'blue',
    playerId: '',
    playerName: '',
    spellSlot: 0
  });

  // Check if current step is complete
  const isStepComplete = (step: TeamBuilderStep): boolean => {
    switch (step) {
      case 'team-names':
        return blueTeamName.trim() !== '' && redTeamName.trim() !== '';
      case 'player-setup':
        return gameState.blueTeam.players.every(p => p.name.trim() !== '' && p.position) &&
               gameState.redTeam.players.every(p => p.name.trim() !== '' && p.position);
      case 'champion-selection':
        return gameState.blueTeam.players.every(p => p.champion) &&
               gameState.redTeam.players.every(p => p.champion);
      case 'summoner-spells':
        return gameState.blueTeam.players.every(p => p.summonerSpells[0] && p.summonerSpells[1]) &&
               gameState.redTeam.players.every(p => p.summonerSpells[0] && p.summonerSpells[1]);
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  // Update completed steps without automatic progression
  useEffect(() => {
    // Don't run step calculation until properly initialized
    if (!isInitialized) return;
    
    const completedSteps = [
      ...(isStepComplete('team-names') ? ['team-names'] : []),
      ...(isStepComplete('player-setup') ? ['player-setup'] : []),
      ...(isStepComplete('champion-selection') ? ['champion-selection'] : []),
      ...(isStepComplete('summoner-spells') ? ['summoner-spells'] : []),
    ] as TeamBuilderStep[];

    setBuilderState(prev => ({
      ...prev,
      completedSteps
    }));
  }, [blueTeamName, redTeamName, gameState, isInitialized]);

  // Handle team name changes
  const handleTeamNameChange = (team: 'blue' | 'red', name: string) => {
    if (team === 'blue') {
      setBlueTeamName(name);
    } else {
      setRedTeamName(name);
    }
    dispatch({ type: 'SET_TEAM_NAME', team, name });
  };

  // Handle player name changes
  const handlePlayerNameChange = (team: 'blue' | 'red', playerId: string, name: string) => {
    dispatch({ type: 'SET_PLAYER_NAME', team, playerId, name });
  };

  // Handle position changes
  const handlePositionChange = (team: 'blue' | 'red', playerIndex: number, position: Position) => {
    const player = gameState[team === 'blue' ? 'blueTeam' : 'redTeam'].players[playerIndex];
    if (player) {
      dispatch({ 
        type: 'SET_PLAYER_POSITION', 
        team, 
        playerId: player.id, 
        position
      });
    }
  };

  // Champion trade handler
  const handleChampionTrade = (
    team: 'blue' | 'red',
    draggedPlayerId: string,
    targetPlayerId: string
  ) => {
    const teamData = gameState[team === 'blue' ? 'blueTeam' : 'redTeam'];
    const draggedPlayer = teamData.players.find(p => p.id === draggedPlayerId);
    const targetPlayer = teamData.players.find(p => p.id === targetPlayerId);

    if (draggedPlayer?.champion && targetPlayer) {
      // Set target player's champion to dragged player's champion
      dispatch({
        type: 'SET_PLAYER_CHAMPION',
        team,
        playerId: targetPlayerId,
        champion: draggedPlayer.champion
      });
      
      // Remove champion from dragged player or swap if target had one
      if (targetPlayer.champion) {
        dispatch({
          type: 'SET_PLAYER_CHAMPION',
          team,
          playerId: draggedPlayerId,
          champion: targetPlayer.champion
        });
      } else {
        dispatch({
          type: 'REMOVE_PLAYER_CHAMPION',
          team,
          playerId: draggedPlayerId
        });
      }
    }
  };

  // Handle champion selection
  const handleOpenChampionSelector = (team: 'blue' | 'red', playerId: string, playerName: string) => {
    setChampionModal({
      isOpen: true,
      team,
      playerId,
      playerName // Use full player name as position is stored separately
    });
  };

  // Navigation functions
  const goToStep = (step: TeamBuilderStep) => {
    setBuilderState(prev => ({
      ...prev,
      currentStep: step,
    }));
  };

  const goToNextStep = () => {
    const stepOrder: TeamBuilderStep[] = ['team-names', 'player-setup', 'champion-selection', 'summoner-spells'];
    const currentIndex = stepOrder.indexOf(builderState.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      goToStep(stepOrder[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const stepOrder: TeamBuilderStep[] = ['team-names', 'player-setup', 'champion-selection', 'summoner-spells'];
    const currentIndex = stepOrder.indexOf(builderState.currentStep);
    if (currentIndex > 0) {
      goToStep(stepOrder[currentIndex - 1]);
    }
  };

  // Handle summoner spell selection
  const handleOpenSummonerSpellSelector = (
    team: 'blue' | 'red', 
    playerId: string, 
    playerName: string, 
    spellSlot: 0 | 1
  ) => {
    setSummonerSpellModal({
      isOpen: true,
      team,
      playerId,
      playerName, // Use full player name as position is stored separately
      spellSlot
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Step 1: Team Names */}
      {builderState.currentStep === 'team-names' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Step 1: Team Names</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blue Team */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-400">
                Blue Team Name
              </label>
              <input
                type="text"
                value={blueTeamName}
                onChange={(e) => handleTeamNameChange('blue', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-blue-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blue team name..."
              />
            </div>

            {/* Red Team */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-red-400">
                Red Team Name
              </label>
              <input
                type="text"
                value={redTeamName}
                onChange={(e) => handleTeamNameChange('red', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-red-500/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter red team name..."
              />
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <div></div> {/* Empty div for spacing */}
            <div className="text-right">
              {isStepComplete('team-names') ? (
                <button
                  onClick={() => goToNextStep()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Continue to Player Setup →
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-500 text-gray-300 rounded-lg cursor-not-allowed font-medium"
                >
                  Enter team names to continue
                </button>
              )}
            </div>
          </div>

          {isStepComplete('team-names') && (
            <div className="text-center text-green-400 font-medium">
              ✅ Team names completed!
            </div>
          )}
        </div>
      )}

      {/* Step 2: Player Setup */}
      {builderState.currentStep === 'player-setup' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Step 2: Player Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blue Team Players */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">{blueTeamName}</h3>
              <div className="space-y-3">
                {gameState.blueTeam.players.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-2 sm:gap-3 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <select
                      value={player.position || ''}
                      onChange={(e) => handlePositionChange('blue', index, e.target.value as Position)}
                      className="px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-20 sm:w-auto flex-shrink-0"
                    >
                      <option value="">Pos</option>
                      {getAllPositions().map(pos => (
                        <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>
                      ))}
                    </select>
                    <div className="w-6 h-6 flex-shrink-0">
                      {player.position && (
                        <PositionIcon position={player.position} size={24} />
                      )}
                    </div>
                    <input
                      type="text"
                      value={player.name || ''}
                      onChange={(e) => handlePlayerNameChange('blue', player.id, e.target.value)}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                      placeholder={`Player ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Red Team Players */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">{redTeamName}</h3>
              <div className="space-y-3">
                {gameState.redTeam.players.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-2 sm:gap-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                    <select
                      value={player.position || ''}
                      onChange={(e) => handlePositionChange('red', index, e.target.value as Position)}
                      className="px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-20 sm:w-auto flex-shrink-0"
                    >
                      <option value="">Pos</option>
                      {getAllPositions().map(pos => (
                        <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>
                      ))}
                    </select>
                    <div className="w-6 h-6 flex-shrink-0">
                      {player.position && (
                        <PositionIcon position={player.position} size={24} />
                      )}
                    </div>
                    <input
                      type="text"
                      value={player.name || ''}
                      onChange={(e) => handlePlayerNameChange('red', player.id, e.target.value)}
                      className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-w-0"
                      placeholder={`Player ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => goToPreviousStep()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              ← Back to Team Names
            </button>
            
            {isStepComplete('player-setup') ? (
              <button
                onClick={() => goToNextStep()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Continue to Champion Selection →
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-2 bg-gray-500 text-gray-300 rounded-lg cursor-not-allowed font-medium"
              >
                Complete player setup to continue
              </button>
            )}
          </div>
          
          {isStepComplete('player-setup') && (
            <div className="text-center text-green-400 font-medium">
              ✅ Player setup completed!
            </div>
          )}
        </div>
      )}

      {/* Step 3: Champion Selection */}
      {builderState.currentStep === 'champion-selection' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Step 3: Champion Selection</h2>
          <p className="text-center text-gray-400 mb-4">
            Select champions for each player. You can drag champions between players on the same team to trade.
          </p>
          
          {/* Champion Selection Interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blue Team Champion Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">{blueTeamName} - Champions</h3>
              <div className="space-y-3">
                {gameState.blueTeam.players.map((player, index) => (
                  <div 
                    key={player.id} 
                    className="flex items-center space-x-3 p-4 bg-blue-900/30 border-2 border-dashed border-blue-500/30 hover:border-blue-400 rounded-lg transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedPlayerId = e.dataTransfer.getData('text/plain');
                      if (draggedPlayerId !== player.id) {
                        handleChampionTrade('blue', draggedPlayerId, player.id);
                      }
                    }}
                  >
                    <div className="w-6 h-6">
                      {player.position && (
                        <PositionIcon position={player.position} size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{player.name}</div>
                      {player.champion ? (
                        <div 
                          className="flex items-center space-x-2 p-2 bg-gray-800 rounded border border-gray-600 cursor-move hover:bg-gray-700"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', player.id)}
                          onClick={() => handleOpenChampionSelector('blue', player.id, player.name)}
                        >
                          <ChampionImage 
                            championImageFull={player.champion.image.full} 
                            alt={player.champion.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-xs text-white">{player.champion.name}</span>
                        </div>
                      ) : (
                        <div 
                          className="text-xs text-gray-400 p-2 bg-gray-800 rounded border-2 border-dashed border-gray-600 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => handleOpenChampionSelector('blue', player.id, player.name)}
                        >
                          Click to select champion
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Team Champion Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">{redTeamName} - Champions</h3>
              <div className="space-y-3">
                {gameState.redTeam.players.map((player, index) => (
                  <div 
                    key={player.id} 
                    className="flex items-center space-x-3 p-4 bg-red-900/30 border-2 border-dashed border-red-500/30 hover:border-red-400 rounded-lg transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedPlayerId = e.dataTransfer.getData('text/plain');
                      if (draggedPlayerId !== player.id) {
                        handleChampionTrade('red', draggedPlayerId, player.id);
                      }
                    }}
                  >
                    <div className="w-6 h-6">
                      {player.position && (
                        <PositionIcon position={player.position} size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{player.name}</div>
                      {player.champion ? (
                        <div 
                          className="flex items-center space-x-2 p-2 bg-gray-800 rounded border border-gray-600 cursor-move hover:bg-gray-700"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', player.id)}
                          onClick={() => handleOpenChampionSelector('red', player.id, player.name)}
                        >
                          <ChampionImage 
                            championImageFull={player.champion.image.full} 
                            alt={player.champion.name}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-xs text-white">{player.champion.name}</span>
                        </div>
                      ) : (
                        <div 
                          className="text-xs text-gray-400 p-2 bg-gray-800 rounded border-2 border-dashed border-gray-600 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => handleOpenChampionSelector('red', player.id, player.name)}
                        >
                          Click to select champion
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => goToPreviousStep()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              ← Back to Player Setup
            </button>
            
            <div className="text-right">
              {isStepComplete('champion-selection') ? (
                <button
                  onClick={() => goToNextStep()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Continue to Summoner Spells →
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-500 text-gray-300 rounded-lg cursor-not-allowed font-medium"
                >
                  Select all champions to continue
                </button>
              )}
            </div>
          </div>

          {isStepComplete('champion-selection') && (
            <div className="text-center text-green-600 font-medium">
              ✅ Champion selection completed!
            </div>
          )}
        </div>
      )}

      {/* Step 4: Summoner Spells */}
      {builderState.currentStep === 'summoner-spells' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Step 4: Summoner Spells</h2>
          <p className="text-center text-gray-400 mb-4">
            Select summoner spells for each player.
          </p>
          
          {/* Summoner Spells Interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blue Team Summoner Spells */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">{blueTeamName} - Summoner Spells</h3>
              <div className="space-y-3">
                {gameState.blueTeam.players.map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-3 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                    <div className="w-6 h-6">
                      {player.position && (
                        <PositionIcon position={player.position} size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{player.name}</div>
                      {player.champion && (
                        <div className="flex items-center space-x-2 mb-2">
                          <ChampionImage 
                            championImageFull={player.champion.image.full} 
                            alt={player.champion.name}
                            className="w-6 h-6 rounded"
                          />
                          <span className="text-xs text-gray-300">{player.champion.name}</span>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        {/* First Summoner Spell */}
                        <div 
                          className="w-12 h-12 border-2 border-dashed border-gray-600 bg-gray-800 rounded flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => handleOpenSummonerSpellSelector('blue', player.id, player.name, 0)}
                        >
                          {player.summonerSpells[0] ? (
                            <SummonerSpellImage 
                              spellImageFull={player.summonerSpells[0].image.full}
                              alt={player.summonerSpells[0].name}
                              className="w-10 h-10 rounded"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">D</span>
                          )}
                        </div>
                        {/* Second Summoner Spell */}
                        <div 
                          className="w-12 h-12 border-2 border-dashed border-gray-600 bg-gray-800 rounded flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => handleOpenSummonerSpellSelector('blue', player.id, player.name, 1)}
                        >
                          {player.summonerSpells[1] ? (
                            <SummonerSpellImage 
                              spellImageFull={player.summonerSpells[1].image.full}
                              alt={player.summonerSpells[1].name}
                              className="w-10 h-10 rounded"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">F</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Team Summoner Spells */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">{redTeamName} - Summoner Spells</h3>
              <div className="space-y-3">
                {gameState.redTeam.players.map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-3 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                    <div className="w-6 h-6">
                      {player.position && (
                        <PositionIcon position={player.position} size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{player.name}</div>
                      {player.champion && (
                        <div className="flex items-center space-x-2 mb-2">
                          <ChampionImage 
                            championImageFull={player.champion.image.full} 
                            alt={player.champion.name}
                            className="w-6 h-6 rounded"
                          />
                          <span className="text-xs text-gray-300">{player.champion.name}</span>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        {/* First Summoner Spell */}
                        <div 
                          className="w-12 h-12 border-2 border-dashed border-gray-600 bg-gray-800 rounded flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => handleOpenSummonerSpellSelector('red', player.id, player.name, 0)}
                        >
                          {player.summonerSpells[0] ? (
                            <SummonerSpellImage 
                              spellImageFull={player.summonerSpells[0].image.full}
                              alt={player.summonerSpells[0].name}
                              className="w-10 h-10 rounded"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">D</span>
                          )}
                        </div>
                        {/* Second Summoner Spell */}
                        <div 
                          className="w-12 h-12 border-2 border-dashed border-gray-600 bg-gray-800 rounded flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                          onClick={() => handleOpenSummonerSpellSelector('red', player.id, player.name, 1)}
                        >
                          {player.summonerSpells[1] ? (
                            <SummonerSpellImage 
                              spellImageFull={player.summonerSpells[1].image.full}
                              alt={player.summonerSpells[1].name}
                              className="w-10 h-10 rounded"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">F</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => goToPreviousStep()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              ← Back to Champion Selection
            </button>
            
            <div className="text-right">
              {isStepComplete('summoner-spells') ? (
                <button
                  onClick={() => goToStep('complete')}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Complete Team Builder! 🎉
                </button>
              ) : (
                <div className="text-gray-400 font-medium">
                  Select summoner spells for all players
                </div>
              )}
            </div>
          </div>
          
          {isStepComplete('summoner-spells') && (
            <div className="text-center text-green-400 font-medium">
              🎉 All done! Team builder complete!
            </div>
          )}
        </div>
      )}

      {/* Step 5: Complete */}
      {builderState.currentStep === 'complete' && (
        <div className="space-y-6">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-center mb-4 text-white">🎉 Team Builder Complete!</h2>
              <p className="text-center text-gray-400 text-lg">
                Your teams are fully configured and ready for action!
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Configuration Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Blue Team:</span>
                  <span className="text-white font-medium">{blueTeamName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Red Team:</span>
                  <span className="text-white font-medium">{redTeamName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Champions Selected:</span>
                  <span className="text-green-400 font-medium">✓ All 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Summoner Spells:</span>
                  <span className="text-green-400 font-medium">✓ Complete</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => goToStep('team-names')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Start Over
              </button>
              <button
                onClick={() => goToPreviousStep()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                ← Edit Teams
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Status - Legacy display for backward compatibility */}
      {isStepComplete('summoner-spells') && builderState.currentStep === 'summoner-spells' && (
        <div className="space-y-4 mt-8">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-green-900/30 text-green-400 rounded-lg border border-green-500/30">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🎉 Team Builder Complete! Your teams are ready for action!
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <div className="flex justify-center space-x-2">
          {(['team-names', 'player-setup', 'champion-selection', 'summoner-spells', 'complete'] as TeamBuilderStep[]).map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                builderState.completedSteps.includes(step as TeamBuilderStep)
                  ? 'bg-green-500'
                  : builderState.currentStep === step
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
              title={step.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Step {(['team-names', 'player-setup', 'champion-selection', 'summoner-spells', 'complete'] as TeamBuilderStep[]).indexOf(builderState.currentStep) + 1} of 5
        </p>
      </div>

      {/* Champion Selection Modal */}
      {championModal.isOpen && (
        <ChampionSelector
          isOpen={championModal.isOpen}
          onClose={() => setChampionModal(prev => ({ ...prev, isOpen: false }))}
          team={championModal.team}
          playerId={championModal.playerId}
          playerName={championModal.playerName}
        />
      )}

      {/* Summoner Spell Selection Modal */}
      {summonerSpellModal.isOpen && (
        <SummonerSpellSelector
          isOpen={summonerSpellModal.isOpen}
          onClose={() => setSummonerSpellModal(prev => ({ ...prev, isOpen: false }))}
          team={summonerSpellModal.team}
          playerId={summonerSpellModal.playerId}
          playerName={summonerSpellModal.playerName}
          spellSlot={summonerSpellModal.spellSlot}
        />
      )}
    </div>
  );
}