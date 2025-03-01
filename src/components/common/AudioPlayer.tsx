import React, { useState, useEffect } from 'react';
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
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  track, 
  onClose,
  currentTime,
  duration,
  isPlaying,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  if (!track) return null;
  
  return (
    <Card 
      backgroundColor="white" 
      padding="0.5rem" 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Flex alignItems="center" gap="1rem">
        {/* Image de couverture */}
        <Image
          src={track.cover_image || "https://via.placeholder.com/60"}
          alt={track.title}
          width="60px"
          height="60px"
          objectFit="cover"
        />
        
        {/* Informations sur la piste */}
        <Flex direction="column" flex={1} maxWidth="30%">
          <Text fontWeight="bold" isTruncated>{track.title}</Text>
          <Text fontSize="small" color="gray">{track.genre}</Text>
        </Flex>
        
        {/* Contrôles de lecture */}
        <Button
          onClick={onPlayPause}
          variation="primary"
          ariaLabel={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </Button>
        
        {/* Progression */}
        <Flex direction="column" flex={2} gap="0.2rem">
          <input
            type="range"
            value={currentTime}
            max={duration || 1}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            step="0.1"
            style={{ width: '100%' }}
          />
          <Flex justifyContent="space-between">
            <Text fontSize="small">{formatTime(currentTime)}</Text>
            <Text fontSize="small">{formatTime(duration)}</Text>
          </Flex>
        </Flex>
        
        {/* Contrôle de volume */}
        <Flex position="relative">
          <Button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            variation="link"
            ariaLabel="Volume"
          >
            {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
          </Button>
          
          {showVolumeSlider && (
            <Card
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                padding: '0.5rem',
                width: '120px',
                zIndex: 101
              }}
            >
              <input
                type="range"
                value={volume}
                max={1}
                min={0}
                step="0.01"
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </Card>
          )}
        </Flex>
        
        {/* Bouton de fermeture */}
        <Button onClick={onClose} variation="link">×</Button>
      </Flex>
    </Card>
  );
};

export default React.memo(AudioPlayer);