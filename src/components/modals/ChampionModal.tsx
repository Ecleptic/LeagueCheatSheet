'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChampionSummary, ChampionDetail } from '@/types/champion';
import { riotApi } from '@/lib/riot-api';
import { useSkinSelection } from '@/contexts/SkinSelectionContext';
import { useChampionInfo } from '@/contexts/ChampionInfoContext';
import { useChampionPositions } from '@/hooks/useChampionPositions';
import { Position } from '@/types/team';
import ImageModal from './ImageModal';
import ChampionImage from '../ui/ChampionImage';
import PassiveImage from '../ui/PassiveImage';
import AbilityImage from '../ui/AbilityImage';
import PositionIcon from '../PositionIcon';

interface ChampionModalProps {
  champion: ChampionSummary;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (championId: string) => void;
}

const ChampionModal: React.FC<ChampionModalProps> = ({
  champion,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [championDetail, setChampionDetail] = useState<ChampionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'abilities' | 'skins'>('overview');

  // Custom Video Player Component
  const CustomVideoPlayer: React.FC<{
    src: string;
    poster: string;
    title: string;
    borderColor: string;
  }> = ({ src, poster, title, borderColor }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayIcon, setShowPlayIcon] = useState(true);

    const togglePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
          setShowPlayIcon(true);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
          setShowPlayIcon(false);
        }
      }
    };

    const handleVideoEnded = () => {
      setIsPlaying(false);
      setShowPlayIcon(true);
    };

    return (
      <div 
        className={`relative w-full aspect-[1056/720] rounded border ${borderColor} bg-gray-800 cursor-pointer overflow-hidden group`}
        onClick={togglePlayPause}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          muted
          preload="metadata"
          poster={poster}
          title={title}
          onEnded={handleVideoEnded}
        />
        
        {/* Play/Pause Overlay */}
        {(showPlayIcon || !isPlaying) && (
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}>
            <div className="w-16 h-16 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
              {isPlaying ? (
                // Pause SVG
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                // Play SVG
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isPlaying && videoRef.current && videoRef.current.readyState < 3 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    );
  };

  // Generate ability video URL based on champion key and ability
  const getAbilityVideoUrl = (championKey: string, abilityKey: 'P' | 'Q' | 'W' | 'E' | 'R'): string => {
    // Pad champion key to 4 digits with leading zeros
    const paddedKey = championKey.padStart(4, '0');
    return `https://lol.dyn.riotcdn.net/x/videos/champion-abilities/${paddedKey}/ability_${paddedKey}_${abilityKey}1.mp4`;
  };
  const { getSelectedSkin, setSelectedSkin } = useSkinSelection();
  const { getChampionInfo, setPlayerName, setNotes } = useChampionInfo();
  const { getChampionPosition } = useChampionPositions();

  // Get the selected skin number for this champion
  const selectedSkinNum = getSelectedSkin(champion.id);

  // Get champion info
  const championInfo = getChampionInfo(champion.id);
  const championPosition = getChampionPosition(champion.id);  // Handler for selecting a skin
  const handleSkinSelect = (skinNum: number) => {
    setSelectedSkin(champion.id, skinNum);
  };
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageAlt: string;
    title?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    imageAlt: '',
    title: '',
  });

  useEffect(() => {
    if (isOpen && champion) {
      fetchChampionDetail();
    }
  }, [isOpen, champion]);

  const fetchChampionDetail = async () => {
    try {
      setLoading(true);
      const response = await riotApi.getChampionDetail(champion.id);
      setChampionDetail(response.data[champion.id]);
    } catch (error) {
      console.error('Error fetching champion detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = () => {
    onToggleFavorite(champion.id);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const openImageModal = (imageUrl: string, imageAlt: string, title?: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      imageAlt,
      title,
    });
  };

  const closeImageModal = () => {
    setImageModal(prev => ({ ...prev, isOpen: false }));
  };

  if (!isOpen) return null;

  const splashUrl = riotApi.getChampionSplashUrl(champion.id, selectedSkinNum);

  return (
    <div 
      className="fixed inset-0 bg-riot-dark z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="h-full">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-700 relative min-h-[60vh]">
          <img
            src={splashUrl}
            alt={`${champion.name} splash art`}
            className="w-full h-full min-h-[60vh] object-cover object-center opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
          
          {/* Navigation */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              ×
            </button>
            <div className="flex items-center space-x-2">
              {/* Mobalytics Guide Link */}
              <a
                href={`https://mobalytics.gg/lol/champions/${champion.id.toLowerCase()}/guide`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm hover:bg-black/70 transition-colors flex items-center space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span>📊</span>
                <span>Guide</span>
              </a>
              <button
                onClick={handleFavoriteClick}
                className={`w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors ${
                  isFavorite ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                {isFavorite ? '⭐' : '☆'}
              </button>
            </div>
          </div>

          {/* Champion Info */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="flex items-center space-x-4 mb-3">
              <ChampionImage
                championImageFull={`${champion.id}.png`}
                alt={`${champion.name} icon`}
                className="w-16 h-16 rounded-full border-2 border-white/20 bg-black/20 backdrop-blur-sm"
              />
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{champion.name}</h2>
                <p className="text-red-200 text-lg">{champion.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Show positions if available, otherwise show role */}
              {championPosition ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-600/80 text-white text-sm rounded-full">
                    <PositionIcon 
                      position={championPosition.primary.toLowerCase() as Position} 
                      size={16} 
                      className="text-white"
                    />
                    <span>{championPosition.primary}</span>
                  </div>
                  {championPosition.secondary && championPosition.secondary.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-600/60 text-white text-xs rounded-full">
                      <PositionIcon 
                        position={championPosition.secondary[0].toLowerCase() as Position} 
                        size={14} 
                        className="text-white opacity-80"
                      />
                      <span>{championPosition.secondary[0]}</span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="px-3 py-1 bg-red-600/80 text-white text-sm rounded-full">
                  {champion.tags[0]}
                </span>
              )}
              <span className="text-white/90 text-sm">● {champion.stats.attackrange > 300 ? 'Ranged' : 'Melee'}</span>
              <span className="text-white/90 text-sm">
                {champion.info.difficulty <= 3 ? 'Easy' : 
                 champion.info.difficulty <= 6 ? 'Medium' : 'Hard'}
              </span>
            </div>
            
            {/* Player Name Input (only for favorited champions) */}
            {isFavorite && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter player name..."
                  value={championInfo.playerName || ''}
                  onChange={(e) => setPlayerName(champion.id, e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 backdrop-blur-sm text-white placeholder-gray-300 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-riot-gold focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-riot-gray sticky top-0 z-10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-riot-blue text-riot-blue bg-riot-dark'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('abilities')}
              className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                activeTab === 'abilities'
                  ? 'border-riot-blue text-riot-blue bg-riot-dark'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Abilities
            </button>
            <button
              onClick={() => setActiveTab('skins')}
              className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                activeTab === 'skins'
                  ? 'border-riot-blue text-riot-blue bg-riot-dark'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Skins
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-riot-blue"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && championDetail && (
                <div>
                  {/* Quick Stats */}
                  <div className="flex justify-between items-center mb-6 bg-riot-gray rounded-lg p-4">
                    <div className="text-center">
                      {championPosition ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-lg font-bold text-blue-400">
                            <PositionIcon 
                              position={championPosition.primary.toLowerCase() as Position} 
                              size={20}
                              className="text-blue-400"
                            />
                            <span>{championPosition.primary}</span>
                          </div>
                          <div className="text-xs text-gray-400">Primary Position</div>
                          {championPosition.secondary && championPosition.secondary.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-300">
                              <PositionIcon 
                                position={championPosition.secondary[0].toLowerCase() as Position} 
                                size={14}
                                className="text-gray-400"
                              />
                              <span className="text-xs">{championPosition.secondary[0]}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-red-400">{champion.tags[0]}</div>
                          <div className="text-xs text-gray-400">Primary Role</div>
                        </>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        {champion.info.difficulty <= 3 ? 'Easy' : 
                         champion.info.difficulty <= 6 ? 'Medium' : 'Hard'}
                      </div>
                      <div className="text-xs text-gray-400">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {champion.stats.attackrange > 300 ? 'Ranged' : 'Melee'}
                      </div>
                      <div className="text-xs text-gray-400">Range Type</div>
                    </div>
                  </div>

                  {/* Notes Box (only for favorited champions) */}
                  {isFavorite && (
                    <div className="bg-riot-gray rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-3 text-riot-blue">Personal Notes</h3>
                      <textarea
                        placeholder="Add your personal notes about this champion..."
                        value={championInfo.notes || ''}
                        onChange={(e) => setNotes(champion.id, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-riot-dark text-gray-300 placeholder-gray-500 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-riot-gold focus:border-transparent resize-none"
                      />
                    </div>
                  )}

                  {/* Champion Lore */}
                  <div className="bg-riot-gray rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3 text-riot-blue">Champion Lore</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {championDetail.lore || champion.blurb}
                    </p>
                  </div>

                  {/* Gallery */}
                  <div className="bg-riot-gray rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-riot-blue">Champion Gallery</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-riot-dark rounded-lg overflow-hidden cursor-pointer hover:bg-opacity-80 transition-all"
                           onClick={() => openImageModal(
                             `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${selectedSkinNum}.jpg`,
                             "Loading Screen",
                             `${champion.name} - Loading Screen`
                           )}>
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${selectedSkinNum}.jpg`}
                          alt="Loading Screen"
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                        <div className="p-2">
                          <p className="text-xs text-gray-400 text-center">Loading Screen</p>
                        </div>
                      </div>
                      <div className="bg-riot-dark rounded-lg overflow-hidden cursor-pointer hover:bg-opacity-80 transition-all"
                           onClick={async () => {
                             const imageUrl = await riotApi.getChampionImageUrl(champion.image.full);
                             openImageModal(
                               imageUrl,
                               "Portrait",
                               `${champion.name} - Champion Portrait`
                             );
                           }}>
                        <ChampionImage
                          championImageFull={champion.image.full}
                          alt="Portrait"
                          className="w-full h-32 object-cover bg-gray-800"
                        />
                        <div className="p-2">
                          <p className="text-xs text-gray-400 text-center">Champion Portrait</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Abilities Tab */}
              {activeTab === 'abilities' && championDetail && (
                <div className="space-y-4">
                  {/* Passive */}
                  <div className="bg-riot-gray rounded-lg p-4">
                    <div className="flex items-start space-x-4 mb-4">
                      <PassiveImage
                        passiveImageFull={championDetail.passive.image.full}
                        alt="Passive"
                        className="w-16 h-16 rounded border-2 border-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-purple-400">{championDetail.passive.name}</h4>
                          <span className="px-2 py-1 bg-purple-900/50 text-purple-200 text-xs rounded">PASSIVE</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {championDetail.passive.description.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Full Width Video */}
                    <div className="w-full">
                      <CustomVideoPlayer
                        src={getAbilityVideoUrl(champion.key, 'P')}
                        poster={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/passive/${championDetail.passive.image.full}`}
                        title="Passive Ability Video"
                        borderColor="border-purple-500/50"
                      />
                    </div>
                  </div>

                  {/* Spells */}
                  {championDetail.spells.map((spell, index) => {
                    const abilityKeys: ('Q' | 'W' | 'E' | 'R')[] = ['Q', 'W', 'E', 'R'];
                    const abilityKey = abilityKeys[index];
                    
                    return (
                      <div key={spell.id} className="bg-riot-gray rounded-lg p-4">
                        <div className="flex items-start space-x-4 mb-4">
                          <AbilityImage
                            abilityImageFull={spell.image.full}
                            alt={spell.name}
                            className={`w-16 h-16 rounded border-2 ${
                              index === 0 ? 'border-blue-500' :
                              index === 1 ? 'border-green-500' :
                              index === 2 ? 'border-orange-500' : 'border-red-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-semibold ${
                                index === 0 ? 'text-blue-400' :
                                index === 1 ? 'text-green-400' :
                                index === 2 ? 'text-orange-400' : 'text-red-400'
                              }`}>{spell.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${
                                index === 0 ? 'bg-blue-900/50 text-blue-200' :
                                index === 1 ? 'bg-green-900/50 text-green-200' :
                                index === 2 ? 'bg-orange-900/50 text-orange-200' : 'bg-red-900/50 text-red-200'
                              }`}>
                                {index === 3 ? 'ULTIMATE' : abilityKey}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed mb-2">
                              {spell.description.replace(/<[^>]*>/g, '')}
                            </p>
                            <div className="text-xs text-gray-400">
                              <span className="text-yellow-400">Cooldown:</span> {spell.cooldownBurn}s
                              {spell.costBurn !== '0' && (
                                <>
                                  {' | '}
                                  <span className="text-blue-400">Cost:</span> {spell.costBurn}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Full Width Video */}
                        <div className="w-full">
                          <CustomVideoPlayer
                            src={getAbilityVideoUrl(champion.key, abilityKey)}
                            poster={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/${spell.image.full}`}
                            title={`${abilityKey} Ability Video`}
                            borderColor={
                              index === 0 ? 'border-blue-500/50' :
                              index === 1 ? 'border-green-500/50' :
                              index === 2 ? 'border-orange-500/50' : 'border-red-500/50'
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Skins Tab */}
              {activeTab === 'skins' && championDetail && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="bg-riot-gray rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-riot-blue">Champion Skins</h3>
                    <p className="text-sm text-gray-400">
                      Click on any skin to select it as your preferred skin for {champion.name}. 
                      Your selection will be used throughout the app.
                    </p>
                  </div>

                  {/* Skins List */}
                  <div className="space-y-6">
                  {championDetail.skins.map((skin) => (
                    <div 
                      key={skin.id} 
                      className={`bg-riot-gray rounded-lg overflow-hidden transition-all ${
                        selectedSkinNum === skin.num
                          ? 'ring-2 ring-riot-gold ring-offset-2 ring-offset-riot-dark'
                          : ''
                      }`}
                    >
                      {/* Main Splash Art */}
                      <div className="relative">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`}
                          alt={skin.name}
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          loading="lazy"
                          onClick={() => {
                            openImageModal(
                              `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`,
                              skin.name,
                              `${champion.name} - ${skin.name === 'default' ? 'Classic' : skin.name} Splash Art`
                            );
                          }}
                        />
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className={`font-semibold ${skin.name.includes('Prestige') ? 'text-yellow-400' : ''}`}>
                              {skin.name === 'default' ? `Classic ${champion.name}` : skin.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded ${
                              skin.name === 'default' ? 'bg-green-900/50 text-green-200' :
                              skin.name.includes('Prestige') ? 'bg-yellow-900/50 text-yellow-200' :
                              'bg-blue-900/50 text-blue-200'
                            }`}>
                              {skin.name === 'default' ? 'FREE' : 
                               skin.name.includes('Prestige') ? 'PRESTIGE' : 'RP'}
                            </span>
                          </div>
                          
                          {/* Select Button */}
                          <button
                            onClick={() => handleSkinSelect(skin.num)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              selectedSkinNum === skin.num
                                ? 'bg-riot-gold text-riot-dark hover:bg-yellow-400'
                                : 'bg-riot-blue text-white hover:bg-blue-600'
                            }`}
                          >
                            {selectedSkinNum === skin.num ? 'Selected' : 'Select'}
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-4">
                          {skin.name === 'default' ? 'The original champion design' : 'Alternative champion skin'}
                        </p>
                        
                        {/* Additional Images Row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-riot-dark rounded-lg overflow-hidden cursor-pointer hover:bg-opacity-80 transition-all"
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 const imageUrl = await riotApi.getChampionImageUrl(`${champion.id}.png`);
                                 openImageModal(
                                   imageUrl,
                                   `${champion.name} icon`,
                                   `${champion.name} - Champion Icon`
                                 );
                               }}>
                            <ChampionImage
                              championImageFull={`${champion.id}.png`}
                              alt={`${champion.name} icon`}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2">
                              <p className="text-xs text-gray-400 text-center">Champion Icon</p>
                            </div>
                          </div>
                          <div className="bg-riot-dark rounded-lg overflow-hidden cursor-pointer hover:bg-opacity-80 transition-all"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 openImageModal(
                                   `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${skin.num}.jpg`,
                                   `${skin.name} loading screen`,
                                   `${champion.name} - ${skin.name === 'default' ? 'Classic' : skin.name} Loading Screen`
                                 );
                               }}>
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${skin.num}.jpg`}
                              alt={`${skin.name} loading screen`}
                              className="w-full h-32 object-cover"
                              loading="lazy"
                            />
                            <div className="p-2">
                              <p className="text-xs text-gray-400 text-center">Loading Screen</p>
                            </div>
                          </div>
                          <div className="bg-riot-dark rounded-lg overflow-hidden cursor-pointer hover:bg-opacity-80 transition-all"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 openImageModal(
                                   `https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${champion.id}_${skin.num}.jpg`,
                                   `${skin.name} centered`,
                                   `${champion.name} - ${skin.name === 'default' ? 'Classic' : skin.name} Portrait`
                                 );
                               }}>
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${champion.id}_${skin.num}.jpg`}
                              alt={`${skin.name} centered`}
                              className="w-full h-32 object-cover"
                              loading="lazy"
                              onError={(e) => {
                                // Fallback to splash if centered doesn't exist
                                e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`;
                              }}
                            />
                            <div className="p-2">
                              <p className="text-xs text-gray-400 text-center">Portrait</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        imageUrl={imageModal.imageUrl}
        imageAlt={imageModal.imageAlt}
        title={imageModal.title}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default ChampionModal;