'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';

interface ChampionInfo {
  playerName?: string;
  notes?: string;
}

interface ChampionInfoContextType {
  getChampionInfo: (championId: string) => ChampionInfo;
  setPlayerName: (championId: string, playerName: string) => void;
  setNotes: (championId: string, notes: string) => void;
  clearChampionInfo: (championId: string) => void;
}

const ChampionInfoContext = createContext<ChampionInfoContextType | undefined>(undefined);

export const useChampionInfo = (): ChampionInfoContextType => {
  const context = useContext(ChampionInfoContext);
  if (!context) {
    throw new Error('useChampionInfo must be used within a ChampionInfoProvider');
  }
  return context;
};

interface ChampionInfoProviderProps {
  children: ReactNode;
}

export const ChampionInfoProvider: React.FC<ChampionInfoProviderProps> = ({ children }) => {
  const [championInfos, setChampionInfos] = useState<Record<string, ChampionInfo>>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lol-champion-infos');
      if (saved) {
        setChampionInfos(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading champion infos from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever championInfos changes
  useEffect(() => {
    try {
      localStorage.setItem('lol-champion-infos', JSON.stringify(championInfos));
    } catch (error) {
      console.error('Error saving champion infos to localStorage:', error);
    }
  }, [championInfos]);

  const getChampionInfo = useCallback((championId: string): ChampionInfo => {
    return championInfos[championId] || {};
  }, [championInfos]);

  const setPlayerName = useCallback((championId: string, playerName: string) => {
    setChampionInfos(prev => ({
      ...prev,
      [championId]: {
        ...prev[championId],
        playerName: playerName.trim() || undefined
      }
    }));
  }, []);

  const setNotes = useCallback((championId: string, notes: string) => {
    setChampionInfos(prev => ({
      ...prev,
      [championId]: {
        ...prev[championId],
        notes: notes.trim() || undefined
      }
    }));
  }, []);

  const clearChampionInfo = useCallback((championId: string) => {
    setChampionInfos(prev => {
      const newInfos = { ...prev };
      delete newInfos[championId];
      return newInfos;
    });
  }, []);

  const contextValue = useMemo(() => ({
    getChampionInfo,
    setPlayerName,
    setNotes,
    clearChampionInfo
  }), [getChampionInfo, setPlayerName, setNotes, clearChampionInfo]);

  return (
    <ChampionInfoContext.Provider value={contextValue}>
      {children}
    </ChampionInfoContext.Provider>
  );
};