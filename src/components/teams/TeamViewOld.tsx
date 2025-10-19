'use client';

import React, { useState } from 'react';
import StatsIcon from '@/components/icons/StatsIcon';
import { useTeam } from '../../contexts/TeamContext';
import MultiStepTeamBuilder from './MultiStepTeamBuilder';
import ConfirmationModal from '../modals/ConfirmationModal';
import InputModal from '../modals/InputModal';
import ConfigurationSelectModal from '../modals/ConfigurationSelectModal';
import ToastContainer, { Toast } from '../ToastContainer';

interface SavedConfiguration {
  name: string;
  gameState: Record<string, unknown>;
  builderState: Record<string, unknown>;
  savedAt: string;
}

const TeamView: React.FC = () => {
  const { gameState, dispatch } = useTeam();
  
  // Modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Saved configurations
  const [savedConfigs, setSavedConfigs] = useState<Record<string, SavedConfiguration>>({});

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
          // Determine current builder state based on completion
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
    addToast({
      type: 'info',
      title: 'Game Reset',
      message: 'All team data has been cleared. Start fresh!'
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
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="flex items-center gap-2"><StatsIcon className="w-5 h-5" /> League Team Builder</span>
            </h1>
            <p className="text-blue-200 text-lg">
              Create your perfect League of Legends team composition
            </p>
          </div>

          {/* Multi-Step Team Builder */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl m-4 p-6">
            {/* Team Builder Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Team Builder</h1>
                <p className="text-gray-400 text-sm">Create and configure your League of Legends team compositions</p>
              </div>
              
              {/* Team Builder Controls */}
              <div className="flex flex-wrap gap-2">
                <button 
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                  onClick={openLoadModal}
                  title="Load a previously saved team configuration"
                >
                  <span className="text-base">📂</span>
                  <span className="hidden sm:inline">Load</span>
                </button>
                
                <button 
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                  onClick={() => setShowSaveModal(true)}
                  title="Save current team configuration"
                >
                  <span className="text-base">💾</span>
                  <span className="hidden sm:inline">Save</span>
                </button>
                
                <button 
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
                  onClick={() => setShowResetConfirm(true)}
                  title="Reset and start fresh"
                >
                  <span className="text-base">🔄</span>
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
            
            {/* Multi-Step Team Builder Content */}
            <MultiStepTeamBuilder />
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default TeamView;