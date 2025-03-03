import React from 'react';
import { 
  Card, 
  Text, 
  Flex, 
  Badge, 
  Button, 
  Image,
  View
} from '@aws-amplify/ui-react';
import { FaPlay, FaPause, FaDownload, FaEllipsisH, FaMusic } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Track } from '../../types/TrackTypes';
import { useAudioContext } from '../../contexts/AudioContext';
import LikeButton from '../common/LikeButton';

interface TrackCardProps {
  track: Track;
  onPlay?: () => void;
  showLikeButton?: boolean;
  isInFavorites?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  track,
  onPlay,
  showLikeButton = false,
  isInFavorites = false
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, togglePlay } = useAudioContext();
  const isCurrentTrack = currentTrack?.track_id === track.track_id;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    } else if (isCurrentTrack) {
      togglePlay();
    }
  };
  
  const handleCardClick = () => {
    navigate(`/tracks/${track.track_id}`);
  };
  
  return (
    <Card
      padding="1rem"
      variation="outlined"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <Flex gap="1rem">
        {/* Image de couverture */}
        <Image
          src={track.cover_image || "/default-cover.jpg"}
          alt={track.title}
          width="80px"
          height="80px"
          style={{ 
            objectFit: 'cover',
            borderRadius: '4px' 
          }}
        />
        
        {/* Informations piste */}
        <Flex direction="column" flex="1" justifyContent="space-between">
          <Flex direction="column">
            <Text fontWeight="bold">{track.title}</Text>
            <Text 
              fontSize="0.9rem" 
              color="#a0a0a0"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${track.user_id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              {track.artist}
            </Text>
          </Flex>
          
          <Flex gap="0.5rem" wrap="wrap">
            <Badge variation="info">{track.genre}</Badge>
            {track.bpm && (
              <Badge variation="warning">{track.bpm} BPM</Badge>
            )}
          </Flex>
        </Flex>
        
        {/* Actions */}
        <Flex direction="column" justifyContent="center" gap="0.5rem">
          <Button
            onClick={handlePlayClick}
            variation="primary"
            size="small"
            gap="0.5rem"
          >
            {isCurrentTrack && isPlaying ? <FaPause /> : <FaPlay />}
            {isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Flex justifyContent="flex-end" gap="0.5rem">
            {showLikeButton && (
              <LikeButton 
                trackId={track.track_id}
                likesCount={track.likes || 0}
                size="small"
                isCompact
              />
            )}
            
            {!isInFavorites && track.downloads !== undefined && (
              <Text fontSize="0.8rem" color="#a0a0a0">
                <FaDownload style={{ marginRight: '4px' }} />
                {track.downloads}
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default React.memo(TrackCard);