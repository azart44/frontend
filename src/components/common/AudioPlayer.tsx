import React, { useState } from 'react';
import { 
  Card, 
  Flex, 
  Text, 
  Button, 
  View,
  Image
} from '@aws-amplify/ui-react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { Track } from '../../types/TrackTypes';

interface AudioPlayerProps {
  track: Track | null;
  onClose: () => void;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

/**
 * Formater le temps en minutes:secondes
 * @param seconds Temps en secondes
 * @returns Temps formaté (MM:SS)
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Composant de lecteur audio avec contrôles
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  track, 
  onClose,
  currentTime,
  duration,
  isPlaying,
  isLoading,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [progressHover, setProgressHover] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Ne rien afficher si aucune piste n'est sélectionnée
  if (!track) return null;
  
  // URL de l'image avec fallback
  const coverImageSrc = imageError || !track.cover_image ? "/default-cover.jpg" : track.cover_image;
  
  return (
    <View 
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      height="80px"
      backgroundColor="#121416"
      padding="0 1rem"
      style={{ 
        borderTop: "1px solid #2a2d36",
        zIndex: 1000
      }}
    >
      <Flex height="100%" alignItems="center" justifyContent="space-between">
        {/* Informations sur la piste en cours */}
        <Flex alignItems="center" flex="1" maxWidth="30%">
          <Image
            src={coverImageSrc}
            alt={track.title}
            width="60px"
            height="60px"
            objectFit="cover"
            style={{ borderRadius: "4px" }}
            marginRight="1rem"
            onError={() => setImageError(true)}
          />
          
          {/* Informations sur la piste */}
          <Flex direction="column" flex="1">
            <Text fontWeight="bold" isTruncated>{track.title}</Text>
            <Text fontSize="small" color="#87e54c">{track.genre}</Text>
          </Flex>
        </Flex>
        
        {/* Contrôles de lecture */}
        <Flex direction="column" alignItems="center" flex="1">
          <Flex alignItems="center" gap="1rem">
            {/* Bouton précédent */}
            {onPrevious && (
              <Button
                onClick={onPrevious}
                variation="link"
                ariaLabel="Précédent"
                padding="0"
              >
                <FaVolumeUp color="#808080" />
              </Button>
            )}
            
            {/* Bouton lecture/pause */}
            <Button
              onClick={onPlayPause}
              variation="primary"
              ariaLabel={isPlaying ? "Pause" : "Play"}
              backgroundColor="#3e1dfc"
              size="small"
              borderRadius="50%"
              width="40px"
              height="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              isLoading={isLoading}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </Button>
            
            {/* Bouton suivant */}
            {onNext && (
              <Button
                onClick={onNext}
                variation="link"
                ariaLabel="Suivant"
                padding="0"
              >
                <FaVolumeUp color="#808080" />
              </Button>
            )}
          </Flex>
        </Flex>
        
        {/* Progression */}
        <Flex direction="column" flex="2" gap="0.2rem" marginLeft="1rem" marginRight="1rem">
          <View 
            position="relative" 
            width="100%" 
            height="4px"
            onMouseEnter={() => setProgressHover(true)}
            onMouseLeave={() => setProgressHover(false)}
            style={{
              cursor: 'pointer',
              transition: 'height 0.3s ease',
              height: progressHover ? '8px' : '4px'
            }}
          >
            {/* Fond de la barre de progression */}
            <View 
              backgroundColor="#2a2d36" 
              width="100%" 
              height="100%" 
              style={{ borderRadius: "2px" }}
            />
            
            {/* Progression actuelle */}
            <View 
              backgroundColor="#87e54c" 
              width={`${(currentTime / (duration || 1)) * 100}%`} 
              height="100%" 
              style={{ 
                borderRadius: "2px",
                position: "absolute",
                top: 0,
                left: 0,
                transition: "width 0.1s ease"
              }}
            />
            
            {/* Slider invisible pour l'interaction */}
            <input
              type="range"
              value={currentTime}
              max={duration || 1}
              min={0}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              step="0.1"
              style={{ 
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer"
              }}
            />
          </View>
          <Flex justifyContent="space-between">
            <Text fontSize="0.7rem" color="#a0a0a0">{formatTime(currentTime)}</Text>
            <Text fontSize="0.7rem" color="#a0a0a0">{formatTime(duration)}</Text>
          </Flex>
        </Flex>
        
        {/* Contrôle de volume */}
        <Flex position="relative">
          <Button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            variation="link"
            ariaLabel="Volume"
          >
            {volume > 0 ? <FaVolumeUp color="#a0a0a0" /> : <FaVolumeMute color="#a0a0a0" />}
          </Button>
          
          {showVolumeSlider && (
            <Card
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                padding: '0.5rem',
                width: '120px',
                backgroundColor: "#121416",
                border: "1px solid #2a2d36",
                borderRadius: "8px",
                zIndex: 1001
              }}
            >
              <input
                type="range"
                value={volume}
                max={1}
                min={0}
                step="0.01"
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                style={{ 
                  width: '100%',
                  accentColor: '#3e1dfc'
                }}
              />
            </Card>
          )}
        </Flex>
        
        {/* Bouton de fermeture */}
        <Button 
          onClick={onClose} 
          variation="link"
          ariaLabel="Fermer le lecteur"
        >
          ×
        </Button>
      </Flex>
    </View>
  );
};

export default React.memo(AudioPlayer);