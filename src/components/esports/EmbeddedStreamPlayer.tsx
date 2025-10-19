'use client';

import React, { useState, useEffect } from 'react';
import TwitchIcon from '@/components/icons/TwitchIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';
import LiveBadge from '@/components/icons/LiveBadge';

interface StreamData {
  mediaLocale: {
    englishName: string;
    translatedName: string;
    locale?: string;
  };
  provider: string;
  parameter?: string;
}

interface EmbeddedStreamPlayerProps {
  streams: StreamData[];
  onClose?: () => void;
  onToggleTheatre?: () => void;
  isTheatreMode?: boolean;
}

const EmbeddedStreamPlayer: React.FC<EmbeddedStreamPlayerProps> = ({ streams, onClose, onToggleTheatre, isTheatreMode = false }) => {
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);

  // Priority order for stream selection
  const selectBestStream = (streams: StreamData[]): StreamData | null => {
    if (streams.length === 0) return null;

    // Priority 1: YouTube English
    const youtubeEnglish = streams.find(s => 
      s.provider.toLowerCase() === 'youtube' && 
      s.mediaLocale.englishName.toLowerCase().includes('english')
    );
    if (youtubeEnglish) return youtubeEnglish;

    // Priority 2: Twitch English
    const twitchEnglish = streams.find(s => 
      s.provider.toLowerCase() === 'twitch' && 
      s.mediaLocale.englishName.toLowerCase().includes('english')
    );
    if (twitchEnglish) return twitchEnglish;

    // Priority 3: Any YouTube Korean
    const youtubeKorean = streams.find(s => 
      s.provider.toLowerCase() === 'youtube' && 
      (s.mediaLocale.englishName.toLowerCase().includes('korean') || s.mediaLocale.locale === 'ko-KR')
    );
    if (youtubeKorean) return youtubeKorean;

    // Priority 4: Any Twitch Korean
    const twitchKorean = streams.find(s => 
      s.provider.toLowerCase() === 'twitch' && 
      (s.mediaLocale.englishName.toLowerCase().includes('korean') || s.mediaLocale.locale === 'ko-KR')
    );
    if (twitchKorean) return twitchKorean;

    // Priority 5: Any YouTube stream
    const anyYoutube = streams.find(s => s.provider.toLowerCase() === 'youtube');
    if (anyYoutube) return anyYoutube;

    // Priority 6: Any Twitch stream
    const anyTwitch = streams.find(s => s.provider.toLowerCase() === 'twitch');
    if (anyTwitch) return anyTwitch;

    // Fallback: first available stream
    return streams[0];
  };

  useEffect(() => {
    const best = selectBestStream(streams);
    setSelectedStream(best);
  }, [streams]);

  if (!selectedStream || !selectedStream.parameter) {
    return (
      <div className="bg-riot-dark border border-gray-600 rounded-lg p-6 text-center">
  <div className="text-gray-400 mb-2"><TwitchIcon className="w-6 h-6" /></div>
        <div className="text-sm text-gray-300">No embeddable stream available</div>
        <div className="text-xs text-gray-500 mt-1">Stream may only be available on the platform website</div>
      </div>
    );
  }

  const getEmbedUrl = (stream: StreamData): string | null => {
    if (!stream.parameter) return null;

    const provider = stream.provider.toLowerCase();

    if (provider === 'youtube') {
      // YouTube embed URL
      const videoId = stream.parameter.includes('/') 
        ? stream.parameter.split('/').pop() 
        : stream.parameter;
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    } else if (provider === 'twitch') {
      // Twitch embed URL
      const channel = stream.parameter;
      return `https://player.twitch.tv/?channel=${channel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&autoplay=true`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(selectedStream);

  if (!embedUrl) {
    return (
      <div className="bg-riot-dark border border-gray-600 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">⚠️</div>
        <div className="text-sm text-gray-300">Unable to embed {selectedStream.provider} stream</div>
      </div>
    );
  }

  const providerIcon = selectedStream.provider.toLowerCase() === 'youtube' ? <YouTubeIcon className="w-5 h-5" /> : <TwitchIcon className="w-5 h-5" />;
  const providerColor = selectedStream.provider.toLowerCase() === 'youtube' 
    ? 'text-red-400' 
    : 'text-purple-400';

  return (
    <div className={`${isTheatreMode ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
      <div className={`${isTheatreMode ? 'h-full' : 'bg-riot-dark border border-gray-600 rounded-lg overflow-hidden'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 bg-riot-gray border-b border-gray-600`}>
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className={`text-lg ${providerColor}`}>{providerIcon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {selectedStream.mediaLocale.translatedName}
              </div>
              <div className="text-xs text-gray-400">
                {selectedStream.provider} Stream
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            {streams.length > 1 && (
              <select
                value={streams.indexOf(selectedStream)}
                onChange={(e) => setSelectedStream(streams[parseInt(e.target.value)])}
                className="text-xs bg-riot-dark border border-gray-500 text-white rounded px-2 py-1 focus:outline-none focus:border-riot-blue"
              >
                {streams.map((stream, idx) => (
                  <option key={idx} value={idx}>
                    {stream.mediaLocale.translatedName} ({stream.provider})
                  </option>
                ))}
              </select>
            )}
            
            {/* Theatre Mode Toggle */}
            {onToggleTheatre && (
              <button
                onClick={onToggleTheatre}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title={isTheatreMode ? 'Exit theatre mode' : 'Theatre mode (show stats)'}
              >
                {isTheatreMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                )}
              </button>
            )}

            {/* Close Button */}
            {onClose && !isTheatreMode && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stream Embed */}
        <div className={`relative ${isTheatreMode ? 'h-[calc(100%-60px)]' : 'aspect-video'} bg-black`}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${selectedStream.provider} Stream - ${selectedStream.mediaLocale.translatedName}`}
          />
        </div>

        {/* Stream Info Footer (only when not theatre mode) */}
        {!isTheatreMode && (
          <div className="p-2 bg-riot-gray/50 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <LiveBadge>LIVE</LiveBadge>
              <span>
                {streams.length} language{streams.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbeddedStreamPlayer;
