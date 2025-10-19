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
import FirstBlood from '@/components/icons/FirstBlood';
import Tower from '@/components/icons/Tower';
import Inhibitor from '@/components/icons/Inhibitor';
import Baron from '@/components/icons/Baron';
import DragonCloud from '@/components/icons/DragonCloud';
import DragonInfernal from '@/components/icons/DragonInfernal';
import DragonMountain from '@/components/icons/DragonMountain';
import DragonOcean from '@/components/icons/DragonOcean';
import DragonHextech from '@/components/icons/DragonHextech';
import DragonChemtech from '@/components/icons/DragonChemtech';
import DragonElder from '@/components/icons/DragonElder';

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
  const teamColorIcon = event.team === 'blue' ? <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2" /> : <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2" />;

      // Display appropriate notification
      switch (event.type) {
        case 'first_blood':
          toast.success(
            <div className="flex items-center gap-2">
              {teamColorIcon}
              <strong>{teamName}</strong>
              <span className="ml-2">drew FIRST BLOOD!</span>
              <FirstBlood className="ml-2 w-4 h-4" />
            </div>,
            { autoClose: 5000, className: 'toast-first-blood' }
          );
          break;

        case 'kill':
          if (event.killerName && event.victimName) {
            toast.info(
              <div className="flex items-center gap-2">
                {teamColorIcon}
                <span>{event.killerName} eliminated {event.victimName}</span>
                <span className="ml-2"><svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M3 12l6-9 6 9 6-9v14H3V12z" fill="#60A5FA"/></svg></span>
              </div>,
              { autoClose: 3000 }
            );
          }
          break;

        case 'tower':
          toast.warning(
            <div className="flex items-center gap-2">
              {teamColorIcon}
              <strong>{teamName}</strong>
              <span className="ml-2">destroyed a tower!</span>
              <Tower className="ml-2 w-4 h-4" />
            </div>,
            { autoClose: 4000 }
          );
          break;

        case 'inhibitor':
          toast.error(
            <div className="flex items-center gap-2">
              {teamColorIcon}
              <strong>{teamName}</strong>
              <span className="ml-2">destroyed an inhibitor!</span>
              <Inhibitor className="ml-2 w-4 h-4" />
            </div>,
            { autoClose: 5000 }
          );
          break;

        case 'dragon':
          toast.info(
            <div className="flex items-center gap-2">
              {teamColorIcon}
              <strong>{teamName}</strong>
              <span className="ml-2">slayed {event.dragonType || 'a'} dragon!</span>
              <span className="ml-2">{getDragonIconNode(event.dragonType)}</span>
            </div>,
            { autoClose: 4000, className: 'toast-dragon' }
          );
          break;

        case 'baron':
          toast.error(
            <div className="flex items-center gap-2">
              {teamColorIcon}
              <strong>{teamName}</strong>
              <span className="ml-2">slayed Baron Nashor!</span>
              <Baron className="ml-2 w-4 h-4" />
            </div>,
            { autoClose: 5000, className: 'toast-baron' }
          );
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
function getDragonIconNode(dragonType?: string): JSX.Element {
  if (!dragonType) return <DragonCloud className="w-4 h-4" />;
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
