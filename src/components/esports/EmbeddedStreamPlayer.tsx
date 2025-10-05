'use client';

import React, { useState, useEffect } from 'react';

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
}

const EmbeddedStreamPlayer: React.FC<EmbeddedStreamPlayerProps> = ({ streams, onClose }) => {
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        <div className="text-gray-400 mb-2">📺</div>
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

  const providerIcon = selectedStream.provider.toLowerCase() === 'youtube' ? '▶️' : '📺';
  const providerColor = selectedStream.provider.toLowerCase() === 'youtube' 
    ? 'text-red-400' 
    : 'text-purple-400';

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
      <div className={`${isFullscreen ? 'h-full' : 'bg-riot-dark border border-gray-600 rounded-lg overflow-hidden'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 bg-riot-gray border-b border-gray-600 ${isFullscreen ? '' : ''}`}>
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
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>

            {/* Close Button */}
            {onClose && !isFullscreen && (
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
        <div className={`relative ${isFullscreen ? 'h-[calc(100%-60px)]' : 'aspect-video'} bg-black`}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${selectedStream.provider} Stream - ${selectedStream.mediaLocale.translatedName}`}
          />
        </div>

        {/* Stream Info Footer (only when not fullscreen) */}
        {!isFullscreen && (
          <div className="p-2 bg-riot-gray/50 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>🔴 LIVE</span>
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
