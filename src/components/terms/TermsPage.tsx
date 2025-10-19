'use client';

import React, { useMemo, useState } from 'react';
import { fetchUrbanDefinitions } from '@/lib/terms/urban';
import { TermEntry } from '@/types/terms';

const SAMPLE_TERMS: TermEntry[] = [
  {
    id: 'first-blood',
    term: 'First Blood',
    aliases: ['fb'],
    definition: 'The very first kill of the match, often rewarded with bonus gold.',
    example: 'Jensen got First Blood on the enemy mid-laner at 2:34 by ganking from river.',
    related: ['kill', 'gold']
  },
  {
    id: 'cs',
    term: 'CS',
    aliases: ['creep score'],
    definition: 'Creep Score — the number of minions and monsters a champion has killed; important for gold income and scaling.',
    example: 'If you see 60 CS at 10 minutes, that usually means the laner is farming well.',
    related: ['gold', 'farm']
  },
  {
    id: 'dragon-soul',
    term: 'Dragon Soul',
    aliases: ['dragon soul'],
    definition: 'A stacking team buff awarded after taking four elemental dragons of the same type; provides a powerful team-wide bonus.',
    example: 'Blue team secured the Infernal Dragon Soul after their jungler stole the fourth dragon.',
    related: ['dragon', 'objectives']
  },
  {
    id: 'tp',
    term: 'TP',
    aliases: ['teleport'],
    definition: 'Teleport — a summoner spell that allows a champion to teleport to allied structures or minions after a channel.',
    example: 'Top laner used TP to join the team fight in bot lane.',
    related: ['map awareness', 'gank']
  }
];

export default function TermsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'term' | 'example'>('all');
  const [includeCommunity, setIncludeCommunity] = useState(false);
  const [communityResults, setCommunityResults] = useState<any[] | null>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_TERMS;

    return SAMPLE_TERMS.filter(entry => {
      if (filter === 'term') return entry.term.toLowerCase().includes(q) || (entry.aliases || []).some(a => a.toLowerCase().includes(q));
      if (filter === 'example') return (entry.example || '').toLowerCase().includes(q);
      return (
        entry.term.toLowerCase().includes(q) ||
        (entry.definition || '').toLowerCase().includes(q) ||
        (entry.example || '').toLowerCase().includes(q) ||
        (entry.aliases || []).some(a => a.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  return (
    <div className="min-h-screen bg-riot-dark text-white pb-20">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">Terminology & Phrases</h1>
          <p className="text-sm text-gray-400">Quick definitions for esports viewers</p>
        </div>
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search terms, examples, aliases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 bg-riot-dark border border-gray-600 rounded-full text-riot-gold placeholder-gray-400 focus:outline-none focus:border-riot-blue"
          />
          <div className="mt-2 flex gap-2 text-xs">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full ${filter === 'all' ? 'bg-riot-blue text-white' : 'bg-gray-700 text-gray-300'}`}>All</button>
            <button onClick={() => setFilter('term')} className={`px-3 py-1 rounded-full ${filter === 'term' ? 'bg-riot-blue text-white' : 'bg-gray-700 text-gray-300'}`}>Term</button>
            <button onClick={() => setFilter('example')} className={`px-3 py-1 rounded-full ${filter === 'example' ? 'bg-riot-blue text-white' : 'bg-gray-700 text-gray-300'}`}>Example</button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeCommunity} onChange={(e) => setIncludeCommunity(e.target.checked)} className="form-checkbox h-4 w-4" />
              <span>Include community definitions (Urban Dictionary)</span>
            </label>
            {includeCommunity && (
              <button
                onClick={async () => {
                  setCommunityLoading(true);
                  setCommunityError(null);
                  try {
                    const defs = await fetchUrbanDefinitions(query || 'league');
                    setCommunityResults(defs);
                  } catch (err) {
                    setCommunityError('Failed to fetch community definitions.');
                  } finally {
                    setCommunityLoading(false);
                  }
                }}
                className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
              >
                {communityLoading ? 'Fetching...' : 'Fetch Community'}
              </button>
            )}
            {communityError && <div className="text-xs text-red-400">{communityError}</div>}
          </div>
        </div>

        <section>
          <ul className="space-y-4">
            {results.map(entry => (
              <li key={entry.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-md font-semibold">{entry.term} <span className="text-sm text-gray-400">{entry.aliases ? `(${entry.aliases.join(', ')})` : ''}</span></h3>
                    <p className="text-sm text-gray-300 mt-2">{entry.definition}</p>
                    {entry.example && (
                      <p className="text-sm text-riot-gold mt-2 italic">"{entry.example}"</p>
                    )}
                    {entry.related && (
                      <div className="text-xs text-gray-400 mt-2">Related: {entry.related.join(', ')}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 ml-4">ID: {entry.id}</div>
                </div>
              </li>
            ))}
          </ul>

          {results.length === 0 && (
            <div className="text-center py-12 text-gray-400">No terms found for &quot;{query}&quot;</div>
          )}
        </section>
        {communityResults && communityResults.length > 0 && (
          <section className="mt-6 px-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Community Definitions (Urban Dictionary)</h3>
            <div className="space-y-3">
              {communityResults.map((c, i) => (
                <div key={i} className="bg-gray-800 rounded p-3">
                  <div className="text-sm text-gray-200 font-semibold">{c.word} <span className="text-xs text-gray-400">by {c.author}</span></div>
                  <div className="text-xs text-gray-400 mt-2">{c.definition}</div>
                  {c.example && <div className="text-xs text-riot-gold italic mt-2">"{c.example}"</div>}
                  <a className="text-xs text-blue-400 mt-1 block" href={c.permalink} target="_blank" rel="noreferrer">View on Urban Dictionary</a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
