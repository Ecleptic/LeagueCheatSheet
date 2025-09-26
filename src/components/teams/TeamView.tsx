'use client';

import React, { useState } from 'react';
import { useTeam } from '../../contexts/TeamContext';
import MultiStepTeamBuilder from './MultiStepTeamBuilder';
import ConfirmationModal from '../ConfirmationModal';
import InputModal from '../InputModal';
import ConfigurationSelectModal from '../ConfigurationSelectModal';
import ToastContainer, { Toast } from '../ToastContainer';

const TeamView: React.FC = () => {
  const { gameState, dispatch } = useTeam();
  
  // Modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Saved configurations
  const [savedConfigs, setSavedConfigs] = useState<Record<string, any>>({});
  
  // Reset key to force MultiStepTeamBuilder remount
  const [resetKey, setResetKey] = useState(0);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: Date.now().toString(),
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadSavedConfigurations = () => {
    try {
      const configs = JSON.parse(localStorage.getItem('teamConfigurations') || '{}');
      setSavedConfigs(configs);
      return configs;
    } catch (error) {
      console.error('Error loading configurations:', error);
      return {};
    }
  };

  const handleSaveConfiguration = (configName: string) => {
    try {
      const configs = loadSavedConfigurations();
      
      // Save with builder state information
      const configData = {
        gameState,
        builderState: {
          blueTeamName: gameState.blueTeam.name,
          redTeamName: gameState.redTeam.name,
          playersSetup: gameState.blueTeam.players.every(p => p.name.trim() !== '') &&
                       gameState.redTeam.players.every(p => p.name.trim() !== ''),
          championsSelected: gameState.blueTeam.players.every(p => p.champion) &&
                            gameState.redTeam.players.every(p => p.champion),
          summonerSpellsSelected: gameState.blueTeam.players.every(p => p.summonerSpells[0] && p.summonerSpells[1]) &&
                                 gameState.redTeam.players.every(p => p.summonerSpells[0] && p.summonerSpells[1])
        },
        savedAt: new Date().toISOString(),
      };
      
      configs[configName] = configData;
      localStorage.setItem('teamConfigurations', JSON.stringify(configs));
      
      addToast({
        type: 'success',
        title: 'Configuration Saved',
        message: `"${configName}" has been saved successfully!`
      });
    } catch (error) {
      console.error('Save error:', error);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save configuration. Please try again.'
      });
    }
  };

  const handleLoadConfiguration = (configName: string) => {
    try {
      const configs = loadSavedConfigurations();
      const selectedConfig = configs[configName];
      
      if (!selectedConfig) {
        addToast({
          type: 'error',
          title: 'Configuration Not Found',
          message: 'The selected configuration could not be found.'
        });
        return;
      }

      dispatch({ type: 'LOAD_GAME_STATE', gameState: selectedConfig.gameState });
      
      addToast({
        type: 'success',
        title: 'Configuration Loaded',
        message: `"${configName}" has been loaded successfully!`
      });
    } catch (error) {
      console.error('Load error:', error);
      addToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load configuration. Please try again.'
      });
    }
  };

  const handleResetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setResetKey(prev => prev + 1); // Force MultiStepTeamBuilder to remount and reset to step 1
    addToast({
      type: 'info',
      title: 'Game Reset',
      message: 'All team data has been cleared. Start fresh from step 1!'
    });
  };

  const openLoadModal = () => {
    const configs = loadSavedConfigurations();
    if (Object.keys(configs).length === 0) {
      addToast({
        type: 'info',
        title: 'No Configurations',
        message: 'No saved configurations found. Save your first configuration to load it later.'
      });
      return;
    }
    setSavedConfigs(configs);
    setShowLoadModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
        <div className="container mx-auto">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              ⚔️ League Team Builder
            </h1>
            <p className="text-blue-200 text-lg">
              Create your perfect League of Legends team composition
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl m-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Team Builder</h1>
                <p className="text-gray-400 text-sm">Create and configure your League of Legends team compositions</p>
              </div>
              
              {/* Configuration Controls */}
              <div className="flex flex-wrap gap-3 sm:bg-riot-dark/50 sm:p-3 sm:rounded-lg sm:border sm:border-gray-700/50">
                <button 
                  className="group flex items-center gap-2 px-4 py-2 bg-riot-gray hover:bg-gray-700 border border-gray-600 hover:border-riot-blue text-gray-300 hover:text-riot-gold rounded-lg transition-all duration-200 font-medium text-sm"
                  onClick={openLoadModal}
                  title="Load a previously saved team configuration"
                >
                  <span className="text-base opacity-75 group-hover:opacity-100 transition-opacity">📂</span>
                  <span className="hidden sm:inline">Load Config</span>
                </button>
                
                <button 
                  className="group flex items-center gap-2 px-4 py-2 bg-riot-gray hover:bg-gray-700 border border-gray-600 hover:border-riot-gold text-gray-300 hover:text-riot-gold rounded-lg transition-all duration-200 font-medium text-sm"
                  onClick={() => setShowSaveModal(true)}
                  title="Save current team configuration"
                >
                  <span className="text-base opacity-75 group-hover:opacity-100 transition-opacity">💾</span>
                  <span className="hidden sm:inline">Save Config</span>
                </button>
                
                <button 
                  className="group flex items-center gap-2 px-4 py-2 bg-riot-gray hover:bg-gray-700 border border-gray-600 hover:border-red-400 text-gray-300 hover:text-red-400 rounded-lg transition-all duration-200 font-medium text-sm"
                  onClick={() => setShowResetConfirm(true)}
                  title="Reset and start fresh"
                >
                  <span className="text-base opacity-75 group-hover:opacity-100 transition-opacity">🔄</span>
                  <span className="hidden sm:inline">Reset All</span>
                </button>
              </div>
            </div>
            
            <MultiStepTeamBuilder key={resetKey} />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetGame}
        title="Reset Team Builder"
        message="Are you sure you want to reset the game? This will clear all current team data and start fresh."
        confirmText="Reset"
        confirmVariant="danger"
      />

      <InputModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveConfiguration}
        title="Save Team Configuration"
        message="Enter a name for this team configuration. This will save all current team data."
        placeholder="e.g., My Ranked Comp, Scrim Setup..."
        confirmText="Save"
      />

      <ConfigurationSelectModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onSelect={handleLoadConfiguration}
        configurations={savedConfigs}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default TeamView;