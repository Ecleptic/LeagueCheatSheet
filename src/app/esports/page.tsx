'use client';

import React, { useState, useMemo } from 'react';
import { useEsportsLive, useEsportsSchedule, useEsportsLeagues, useEsportsResults, useEsportsStandings } from '@/hooks/useEsports';
import LiveMatchCard from '@/components/esports/LiveMatchCard';
import ScheduleMatchCard from '@/components/esports/ScheduleMatchCard';
import ResultsMatchCard from '@/components/esports/ResultsMatchCard';
import StandingsTable from '@/components/esports/StandingsTable';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components/esports/EsportsUI';

export default function EsportsPage() {
  const [activeSection, setActiveSection] = useState<'live' | 'schedule' | 'results' | 'standings'>('live');
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>('');
  
  // Create stable league filter array
  const leagueFilter = useMemo(() => {
    return selectedLeagueName ? [selectedLeagueName] : undefined;
  }, [selectedLeagueName]);
  
  const { matches: liveMatches, loading: liveLoading, error: liveError } = useEsportsLive();
  const { matches: scheduleMatches, loading: scheduleLoading, error: scheduleError } = useEsportsSchedule(leagueFilter);
  const { matches: resultsMatches, loading: resultsLoading, error: resultsError } = useEsportsResults();
  const { standings, loading: standingsLoading, error: standingsError } = useEsportsStandings();
  const { leagues, loading: leaguesLoading } = useEsportsLeagues();

  return (
    <div className="min-h-screen bg-riot-dark text-riot-gold">
      {/* Header */}
      <header className="bg-riot-gray border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-2">LoL Esports</h1>
          <p className="text-gray-400">Professional League of Legends matches, standings, and statistics</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-riot-gray/50 border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'live', label: '🔴 Live', desc: 'Current matches' },
              { id: 'schedule', label: '📅 Schedule', desc: 'Upcoming games' },
              { id: 'results', label: '🏆 Results', desc: 'Recent matches' },
              { id: 'standings', label: '📊 Standings', desc: 'League tables' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as 'live' | 'schedule' | 'results' | 'standings')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-riot-blue text-white'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-medium">{section.label}</div>
                <div className="text-xs text-gray-500">{section.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'live' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Live Matches</h2>
              {liveMatches.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} live</span>
                </div>
              )}
            </div>
            
            {liveLoading && <LoadingSpinner message="Loading live matches..." />}
            
            {liveError && (
              <ErrorMessage 
                message={liveError}
              />
            )}
            
            {!liveLoading && !liveError && liveMatches.length === 0 && (
              <EmptyState
                icon="🌙"
                title="No Live Matches"
                description="All matches have concluded. Check back later for more live professional League of Legends action!"
              />
            )}
            
            {!liveLoading && !liveError && liveMatches.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveMatches.map((match, index) => (
                  <LiveMatchCard key={`live-${match.id}-${index}`} match={match} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'schedule' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Matches</h2>
              
              {/* League Filter - Mobile First */}
              {!leaguesLoading && leagues.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <label htmlFor="league-filter" className="text-sm text-gray-400 font-medium">
                      Filter by league:
                    </label>
                    <div className="flex-1 sm:flex-none">
                      <select
                        id="league-filter"
                        value={selectedLeagueName || ''}
                        onChange={(e) => setSelectedLeagueName(e.target.value)}
                        className="w-full sm:w-auto bg-riot-gray border border-gray-600 text-white text-sm rounded px-3 py-2 focus:ring-2 focus:ring-riot-blue focus:border-transparent min-w-0"
                      >
                        <option value="">All Leagues</option>
                        {leagues.map((league) => (
                          <option key={league.name} value={league.name}>
                            {league.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-500">
                    {selectedLeagueName ? (
                      <span>
                        Showing matches for{' '}
                        <span className="text-riot-blue font-medium">
                          {selectedLeagueName}
                        </span>
                      </span>
                    ) : (
                      `${leagues.length} league${leagues.length !== 1 ? 's' : ''} available`
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {scheduleLoading && <LoadingSpinner message="Loading upcoming matches..." />}
            
            {scheduleError && (
              <ErrorMessage 
                message={scheduleError}
              />
            )}
            
            {!scheduleLoading && !scheduleError && scheduleMatches.length === 0 && (
              <EmptyState
                icon="📅"
                title="No Upcoming Matches"
                description="Schedule information is currently unavailable. Check back soon for upcoming professional matches!"
              />
            )}
            
            {!scheduleLoading && !scheduleError && scheduleMatches.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduleMatches.slice(0, 12).map((match, index) => (
                  <ScheduleMatchCard key={`schedule-${match.id}-${index}`} match={match} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Results</h2>
              <div className="text-sm text-gray-400">
                Last 20 completed matches
              </div>
            </div>
            
            {resultsLoading && <LoadingSpinner message="Loading recent results..." />}
            
            {resultsError && (
              <ErrorMessage 
                message={resultsError}
              />
            )}
            
            {!resultsLoading && !resultsError && resultsMatches.length === 0 && (
              <EmptyState
                icon="🏆"
                title="No Recent Results"
                description="No completed matches found. Check back after some matches have finished!"
              />
            )}
            
            {!resultsLoading && !resultsError && resultsMatches.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resultsMatches.map((match, index) => (
                  <ResultsMatchCard key={`results-${match.id}-${index}`} match={match} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'standings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">League Standings</h2>
              <div className="text-sm text-gray-400">
                Tournament standings and team statistics
              </div>
            </div>

            {standingsLoading && (
              <LoadingSpinner message="Loading standings..." />
            )}

            {standingsError && (
              <ErrorMessage 
                message={standingsError}
              />
            )}

            {!standingsLoading && !standingsError && standings.length === 0 && (
              <EmptyState 
                icon="📊"
                title="No Standings Available"
                description="No tournament standings are currently available. Check back later for league tables and team statistics!"
              />
            )}
            
            {!standingsLoading && !standingsError && standings.length > 0 && (
              <div className="space-y-6">
                <StandingsTable 
                  standings={standings} 
                  leagueName={selectedLeagueName || "Current Tournament"}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* API Info Footer */}
      <footer className="mt-16 border-t border-gray-600 bg-riot-gray/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <div className="mb-2">Powered by LoL Esports API</div>
            <div className="text-xs">
              Data includes: Live matches, schedules, team rosters, player stats, and match details from official Riot Games esports events
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}