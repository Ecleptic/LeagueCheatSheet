/**
 * LiveEventWatcher - Real-time event notifications for live games
 * 
 * Monitors game events from useLiveGameStats hook and displays toast notifications for:
 * - Kills (including first blood)
 * - Towers destroyed
 * - Inhibitors destroyed
 * - Dragons slain
 * - Baron Nashor slain
 * 
 * Uses react-toastify for stylish, non-intrusive notifications
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GameEvent } from '@/types/esports';

interface LiveEventWatcherProps {
  events: GameEvent[];
  blueTeamName?: string;
  redTeamName?: string;
}

export function LiveEventWatcher({ 
  events, 
  blueTeamName = 'Blue Team',
  redTeamName = 'Red Team' 
}: LiveEventWatcherProps) {
  const processedEvents = useRef(new Set<string>());

  useEffect(() => {
    events.forEach((event) => {
      const eventKey = `${event.timestamp}-${event.type}-${event.team}`;
      
      // Skip if already processed
      if (processedEvents.current.has(eventKey)) {
        return;
      }

      // Mark as processed
      processedEvents.current.add(eventKey);

      // Get team name
      const teamName = event.team === 'blue' ? blueTeamName : redTeamName;
      const teamColor = event.team === 'blue' ? '🔵' : '🔴';

      // Display appropriate notification
      switch (event.type) {
        case 'first_blood':
          toast.success(`${teamColor} ${teamName} drew FIRST BLOOD! 🩸`, {
            autoClose: 5000,
            className: 'toast-first-blood',
          });
          break;

        case 'kill':
          if (event.killerName && event.victimName) {
            toast.info(`${teamColor} ${event.killerName} eliminated ${event.victimName}`, {
              autoClose: 3000,
            });
          }
          break;

        case 'tower':
          toast.warning(`${teamColor} ${teamName} destroyed a tower! 🏰`, {
            autoClose: 4000,
          });
          break;

        case 'inhibitor':
          toast.error(`${teamColor} ${teamName} destroyed an inhibitor! 🔮`, {
            autoClose: 5000,
          });
          break;

        case 'dragon':
          const dragonEmoji = getDragonEmoji(event.dragonType);
          toast.info(`${teamColor} ${teamName} slayed ${event.dragonType || 'a'} dragon! ${dragonEmoji}`, {
            autoClose: 4000,
            className: 'toast-dragon',
          });
          break;

        case 'baron':
          toast.error(`${teamColor} ${teamName} slayed Baron Nashor! 👹`, {
            autoClose: 5000,
            className: 'toast-baron',
          });
          break;

        default:
          break;
      }
    });
  }, [events, blueTeamName, redTeamName]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="dark"
      style={{ zIndex: 9999 }}
    />
  );
}

// Helper function to get appropriate emoji for dragon type
function getDragonEmoji(dragonType?: string): string {
  if (!dragonType) return '🐉';
  
  const dragonEmojis: Record<string, string> = {
    'cloud': '☁️',
    'infernal': '🔥',
    'mountain': '⛰️',
    'ocean': '🌊',
    'chemtech': '☣️',
    'hextech': '⚡',
    'elder': '👑',
  };

  return dragonEmojis[dragonType.toLowerCase()] || '🐉';
}

// Custom CSS for special toasts (add to global styles or component)
export const toastStyles = `
  .toast-first-blood {
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    font-weight: 700;
  }

  .toast-baron {
    background: linear-gradient(135deg, #7c2d12 0%, #431407 100%);
    font-weight: 600;
  }

  .toast-dragon {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  }
`;
