'use client';

import React from 'react';

interface SavedConfiguration {
  name: string;
  gameState: Record<string, unknown>;
  builderState: Record<string, unknown>;
  savedAt: string;
}

interface ConfigurationSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (configName: string) => void;
  configurations: Record<string, SavedConfiguration>;
}

const ConfigurationSelectModal: React.FC<ConfigurationSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  configurations,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const configEntries = Object.entries(configurations);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const getConfigPreview = (config: SavedConfiguration) => {
    const gameState = config.gameState as {
      blueTeam?: { name?: string; players?: unknown[] };
      redTeam?: { name?: string; players?: unknown[] };
    };
    
    const blueTeam = gameState?.blueTeam?.name || 'Blue Team';
    const redTeam = gameState?.redTeam?.name || 'Red Team';
    const playersCount = (gameState?.blueTeam?.players?.length || 0) + 
                        (gameState?.redTeam?.players?.length || 0);
    
    return `${blueTeam} vs ${redTeam} • ${playersCount} players`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Load Configuration</h3>
              <p className="text-gray-400 text-sm mt-1">Choose a saved team configuration to load</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-96">
          {configEntries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📂</div>
              <h4 className="text-lg font-medium text-white mb-2">No Saved Configurations</h4>
              <p className="text-gray-400">Save your first team configuration to see it here.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {configEntries.map(([name, config]) => (
                <button
                  key={name}
                  onClick={() => onSelect(name)}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {name}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {getConfigPreview(config)}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Saved {formatDate(config.savedAt)}
                      </p>
                    </div>
                    <div className="flex items-center text-gray-400 group-hover:text-blue-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationSelectModal;