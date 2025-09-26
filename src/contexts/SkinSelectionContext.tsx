'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface SkinSelection {
  [championId: string]: number; // championId -> skin number
}

interface SkinSelectionContextType {
  selectedSkins: SkinSelection;
  setSelectedSkin: (championId: string, skinNum: number) => void;
  getSelectedSkin: (championId: string) => number;
}

const SkinSelectionContext = createContext<SkinSelectionContextType | undefined>(undefined);

const STORAGE_KEY = 'lol-champion-skin-selections';

export const SkinSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSkins, setSelectedSkins] = useState<SkinSelection>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSelectedSkins(parsed);
      }
    } catch (error) {
      console.warn('Failed to load skin selections from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever selections change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSkins));
    } catch (error) {
      console.warn('Failed to save skin selections to localStorage:', error);
    }
  }, [selectedSkins]);

  const setSelectedSkin = useCallback((championId: string, skinNum: number) => {
    setSelectedSkins(prev => ({
      ...prev,
      [championId]: skinNum
    }));
  }, []);

  const getSelectedSkin = useCallback((championId: string): number => {
    return selectedSkins[championId] ?? 0; // Default to skin 0 (classic)
  }, [selectedSkins]);

  const contextValue = useMemo(() => ({
    selectedSkins,
    setSelectedSkin,
    getSelectedSkin
  }), [selectedSkins, setSelectedSkin, getSelectedSkin]);

  return (
    <SkinSelectionContext.Provider value={contextValue}>
      {children}
    </SkinSelectionContext.Provider>
  );
};

export const useSkinSelection = (): SkinSelectionContextType => {
  const context = useContext(SkinSelectionContext);
  if (context === undefined) {
    throw new Error('useSkinSelection must be used within a SkinSelectionProvider');
  }
  return context;
};