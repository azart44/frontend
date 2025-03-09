// src/components/audio/AudioPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Flex, 
  Text, 
  Image,
  Button 
} from '@aws-amplify/ui-react';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaVolumeUp, 
  FaVolumeMute,
  FaRedo 
} from 'react-icons/fa';
import { useAudioContext } from '../../contexts/AudioContext';

const AudioPlayer: React.FC = () => {
  const { 
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    togglePlay,
    seek,
    error,
    isLoading,
    changeVolume,
    volume,
    playTrack
  } = useAudioContext();
  
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Mettre à jour la valeur du slider lorsque le temps actuel change
  useEffect(() => {
    if (!isDragging && currentTime > 0) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isDragging]);
  
  // Formater le temps (secondes -> MM:SS)
  const formatTime = (timeInSeconds: number): string => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Gérer le changement de position
  const handleSeekChange = (newValue: number) => {
    setSeekValue(newValue);
    setIsDragging(true);
  };
  
  // Appliquer la recherche lorsque l'utilisateur relâche le curseur
  const handleSeekEnd = () => {
    seek(seekValue);
    setIsDragging(false);
  };
  
  // Gérer le clic direct sur la barre de progression
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    setSeekValue(newTime);
    seek(newTime);
  };
  
  // Handler pour réessayer en cas d'erreur
  const handleRetry = () => {
    if (currentTrack) {
      playTrack(currentTrack);
    }
  };
  
  // Si aucune piste n'est chargée, ne rien afficher
  if (!currentTrack) {
    return null;
  }
  
  return (
    <Flex
      width="100%"
      backgroundColor="var(--chordora-primary-dark, #1a1a1a)"
      borderRadius="12px"
      padding="0.75rem 1rem"
      alignItems="center"
      gap="1rem"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      style={{ position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 1000, maxWidth: 'calc(100% - 2rem)' }}
    >
      {/* Image et informations de la piste */}
      <Flex alignItems="center" gap="0.75rem" flex="0 0 auto" width={{ base: '40%', medium: '30%' }}>
        <Image
          src={currentTrack.cover_image || '/default-cover.jpg'}
          alt={currentTrack.title}
          width="50px"
          height="50px"
          borderRadius="4px"
          objectFit="cover"
        />
        <Flex direction="column" overflow="hidden">
          <Text
            fontWeight="bold"
            color="white"
            fontSize="0.95rem"
            style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {currentTrack.title}
          </Text>
          <Text
            color="rgba(255, 255, 255, 0.8)"
            fontSize="0.8rem"
            style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {currentTrack.artist || 'Artiste'}
          </Text>
          
          {/* Afficher une erreur s'il y en a une */}
          {error && (
            <Flex alignItems="center" gap="0.5rem">
              <Text color="#ff6b6b" fontSize="0.8rem">
                {error}
              </Text>
              <Button 
                onClick={handleRetry}
                variation="link"
                padding="0.25rem"
                size="small"
                style={{ color: '#ff6b6b' }}
              >
                <FaRedo />
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
      
      {/* Contrôles de lecture */}
      <Flex direction="column" flex="1" gap="0.5rem">
        <Flex alignItems="center" justifyContent="center" gap="1rem">
          <Button
            onClick={() => {}} // Placeholder pour skiToPrevious
            variation="link"
            padding="0.5rem"
            style={{ color: 'white' }}
          >
            <FaStepBackward />
          </Button>
          
          <Button
            onClick={togglePlay}
            variation="primary"
            size="small"
            isLoading={isLoading}
            style={{ 
              borderRadius: '50%', 
              width: '36px', 
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--chordora-secondary, #3e1dfc)',
              padding: 0
            }}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
          
          <Button
            onClick={() => {}} // Placeholder pour skipToNext
            variation="link"
            padding="0.5rem"
            style={{ color: 'white' }}
          >
            <FaStepForward />
          </Button>
        </Flex>
        
        {/* Barre de progression */}
        <Flex alignItems="center" gap="0.5rem">
          <Text color="rgba(255, 255, 255, 0.8)" fontSize="0.75rem">
            {formatTime(currentTime)}
          </Text>
          
          <div 
            ref={progressRef}
            style={{ 
              flex: 1, 
              height: '4px', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={handleProgressClick}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                backgroundColor: 'var(--chordora-secondary, #3e1dfc)',
                borderRadius: '2px',
                transition: isDragging ? 'none' : 'width 0.1s linear'
              }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={seekValue}
              onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              style={{
                position: 'absolute',
                top: '-8px',
                left: 0,
                width: '100%',
                height: '20px',
                opacity: 0,
                cursor: 'pointer',
                margin: 0,
                padding: 0
              }}
            />
          </div>
          
          <Text color="rgba(255, 255, 255, 0.8)" fontSize="0.75rem">
            {formatTime(duration)}
          </Text>
        </Flex>
      </Flex>
      
      {/* Contrôle du volume */}
      <Flex 
        alignItems="center" 
        gap="0.5rem" 
        position="relative"
        onMouseEnter={() => setShowVolumeControl(true)}
        onMouseLeave={() => setShowVolumeControl(false)}
        style={{ minWidth: '36px' }}
      >
        <Button
          variation="link"
          padding="0.5rem"
          style={{ color: 'white' }}
          onClick={() => changeVolume(volume > 0 ? 0 : 0.8)}
        >
          {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
        </Button>
        
        {showVolumeControl && (
          <div 
            style={{ 
              position: 'absolute',
              bottom: '100%',
              right: 0,
              width: '36px',
              height: '100px',
              backgroundColor: 'var(--chordora-primary-dark, #1a1a1a)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              zIndex: 1001
            }}
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              style={{
                width: '80px',
                height: '100%',
                transform: 'rotate(270deg)',
                margin: 0
              }}
            />
          </div>
        )}
      </Flex>
    </Flex>
  );
};

export default AudioPlayer;