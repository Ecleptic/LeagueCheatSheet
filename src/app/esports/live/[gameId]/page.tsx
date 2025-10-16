/**
 * Live Game Stats Page
 * 
 * This page demonstrates the new live stats features with:
 * - LiveGameStatsView component (desktop + mobile responsive)
 * - LiveEventWatcher for real-time toast notifications
 * - Integrated with existing esports infrastructure
 * 
 * Route: /esports/live/[gameId]
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LiveGameStatsView } from '@/components/esports/LiveGameStatsView';
import { LiveEventWatcher } from '@/components/esports/LiveEventWatcher';
import { useLiveGameStats } from '@/hooks/useEsports';

export default function LiveGameStatsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  // Get live stats and events for notifications
  const { events } = useLiveGameStats(gameId);

  return (
    <div className="min-h-screen bg-riot-dark text-white">
      {/* Live Event Notifications */}
      <LiveEventWatcher events={events} />

      {/* Header with back button */}
      <header className="bg-riot-gray border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-riot-gold hover:text-riot-blue transition-colors mb-3"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back to Esports</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Game Statistics</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time stats, events, and player data</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>Game ID: {gameId}</div>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">Live Updates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <LiveGameStatsView gameId={gameId} />
      </main>

      {/* Footer Info */}
      <footer className="border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">📊 Stats Update</h3>
              <p className="text-xs">Team and player stats refresh every second for real-time accuracy</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">🔔 Event Notifications</h3>
              <p className="text-xs">Get instant toast notifications for kills, objectives, and major events</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">📱 Mobile Optimized</h3>
              <p className="text-xs">Fully responsive design with mobile-specific navigation and layout</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
