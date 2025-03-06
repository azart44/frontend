import React, { useState } from 'react';
import { 
  Text, 
  Flex, 
  Badge, 
  Button, 
  Image
} from '@aws-amplify/ui-react';
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaRegHeart, 
  FaEllipsisH,
  FaPlus
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Track } from '../../types/TrackTypes';
import { useAudioContext } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import LikeButton from '../common/LikeButton';
import AddToPlaylist from '../playlist/AddToPlaylist';

interface TrackCardProps {
  track: Track;
  onPlay?: () => void;
  showLikeButton?: boolean;
  isInFavorites?: boolean;
  displayStyle?: 'compact' | 'full' | 'row';
}

const TrackCard: React.FC<TrackCardProps> = ({ 
  track,
  onPlay,
  showLikeButton = false,
  isInFavorites = false,
  displayStyle = 'full'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currentTrack, isPlaying, togglePlay } = useAudioContext();
  const isCurrentTrack = currentTrack?.track_id === track.track_id;
  
  // État pour gérer les erreurs de chargement d'image
  const [imageError, setImageError] = useState(false);
  // État pour gérer le survol
  const [isHovered, setIsHovered] = useState(false);
  // État pour gérer l'ouverture du modal AddToPlaylist
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  
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
  
  // Gérer l'ajout à une playlist
  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Empêcher tout comportement par défaut
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    setShowAddToPlaylist(true);
  };
  
  // URL de l'image de couverture avec fallback
  const coverImageSrc = !imageError && track.cover_image 
    ? track.cover_image 
    : "/default-cover.jpg";
  
  // Formater le temps de la piste
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Style Row (pour les listes de lecture, tableaux)
  if (displayStyle === 'row') {
    return (
      <>
        <Flex 
          alignItems="center" 
          padding="0.75rem" 
          gap="1rem"
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div style={{ position: 'relative', width: '40px', textAlign: 'center' }}>
            {isHovered ? (
              <button 
                onClick={handlePlayClick}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isCurrentTrack && isPlaying ? 'var(--chordora-secondary)' : 'white'
                }}
              >
                {isCurrentTrack && isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
              </button>
            ) : (
              <span>{track.position !== undefined ? track.position : ''}</span>
            )}
          </div>
          
          <Flex alignItems="center" gap="1rem" flex="1">
            <Image
              src={coverImageSrc}
              alt={track.title}
              width="50px"
              height="50px"
              style={{ 
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={() => setImageError(true)}
            />
            <Flex direction="column">
              <Text 
                fontWeight={isCurrentTrack ? 'bold' : 'normal'}
                color={isCurrentTrack ? 'var(--chordora-secondary)' : 'var(--chordora-text-primary)'}
              >
                {track.title}
              </Text>
              <Flex gap="0.5rem" alignItems="center">
                {track.bpm && (
                  <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
                    {track.bpm} BPM
                  </Text>
                )}
                <Badge size="small" variation="info">{track.genre}</Badge>
              </Flex>
            </Flex>
          </Flex>
          
          <Text 
            onClick={(e) => {
              e.stopPropagation();
              if (track.user_id) {
                navigate(`/profile/${track.user_id}`);
              }
            }}
            style={{ cursor: 'pointer' }}
            color="var(--chordora-text-secondary)"
            width="150px"
          >
            {track.artist || 'Artiste'}
          </Text>
          
          <Text color="var(--chordora-text-secondary)" width="80px">
            {formatTime(track.duration || 0)}
          </Text>
          
          <Flex gap="0.5rem" justifyContent="flex-end">
            {showLikeButton && (
              <LikeButton
                trackId={track.track_id}
                likesCount={track.likes || 0}
                size="small"
                isCompact
              />
            )}
            <Button
              variation="link"
              size="small"
              style={{ padding: 0 }}
              onClick={handleAddToPlaylist}
            >
              <FaPlus color="#a0a0a0" />
            </Button>
            <Button
              variation="link"
              size="small"
              style={{ padding: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                // Show options
              }}
            >
              <FaEllipsisH color="#a0a0a0" />
            </Button>
          </Flex>
        </Flex>

        {/* Toujours inclure le modal, mais contrôlé par isOpen */}
        <AddToPlaylist 
          track={track} 
          isOpen={showAddToPlaylist} 
          onClose={() => setShowAddToPlaylist(false)} 
        />
      </>
    );
  }
  
  // Style Compact (pour les listes latérales, navigation rapide)
  if (displayStyle === 'compact') {
    return (
      <>
        <div 
          className="track-card" 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ position: 'relative', minWidth: '50px', height: '50px' }}>
            <Image
              src={coverImageSrc}
              alt={track.title}
              width="50px"
              height="50px"
              style={{ 
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={() => setImageError(true)}
            />
            {isHovered && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
              >
                <button
                  onClick={handlePlayClick}
                  style={{ 
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--chordora-primary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isCurrentTrack && isPlaying ? (
                    <FaPause color="white" size={12} />
                  ) : (
                    <FaPlay color="white" size={12} />
                  )}
                </button>
              </div>
            )}
          </div>
          
          <Flex direction="column" flex="1" overflow="hidden">
            <Text 
              fontWeight={isCurrentTrack ? 'bold' : 'normal'}
              color={isCurrentTrack ? 'var(--chordora-secondary)' : 'var(--chordora-text-primary)'}
              className="text-truncate"
            >
              {track.title}
            </Text>
            <Text 
              fontSize="0.8rem" 
              color="var(--chordora-text-secondary)"
              className="text-truncate"
            >
              {track.artist || 'Artiste'} • {track.genre}
            </Text>
          </Flex>
          
          {showLikeButton && (
            <Button
              variation="link"
              size="small"
              style={{ padding: 0 }}
              onClick={handleAddToPlaylist}
            >
              <FaPlus color="#a0a0a0" />
            </Button>
          )}
        </div>

        {/* Toujours inclure le modal, mais contrôlé par isOpen */}
        <AddToPlaylist 
          track={track} 
          isOpen={showAddToPlaylist} 
          onClose={() => setShowAddToPlaylist(false)} 
        />
      </>
    );
  }
  
  // Style Full (carte principale)
  return (
    <>
      <div 
        className="track-card"
        style={{ 
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'background-color 0.3s ease',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ position: 'relative' }}>
          <Image
            src={coverImageSrc}
            alt={track.title}
            width="100%"
            style={{ 
              aspectRatio: '1/1',
              objectFit: 'cover'
            }}
            onError={() => setImageError(true)}
          />
          {isHovered && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <button
                onClick={handlePlayClick}
                style={{ 
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--chordora-primary)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                {isCurrentTrack && isPlaying ? (
                  <FaPause color="white" size={20} />
                ) : (
                  <FaPlay color="white" size={20} />
                )}
              </button>
            </div>
          )}
          
          {/* Badge pour le genre */}
          <Badge
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem'
            }}
          >
            {track.genre}
          </Badge>
        </div>
        
        <div style={{ padding: '0.75rem' }}>
          <Text 
            fontWeight="bold"
            className="text-truncate"
            style={{ marginBottom: '0.25rem' }}
          >
            {track.title}
          </Text>
          <Text 
            fontSize="0.9rem" 
            color="var(--chordora-text-secondary)"
            className="text-truncate"
            style={{ marginBottom: '0.5rem' }}
            onClick={(e) => {
              e.stopPropagation();
              if (track.user_id) {
                navigate(`/profile/${track.user_id}`);
              }
            }}
          >
            {track.artist || 'Artiste'}
          </Text>
          
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="0.8rem" color="var(--chordora-text-secondary)">
              {formatTime(track.duration || 0)}
            </Text>
            
            <Flex gap="0.5rem">
              {showLikeButton && (
                <LikeButton
                  trackId={track.track_id}
                  likesCount={track.likes || 0}
                  size="small"
                  isCompact
                />
              )}
              <Button
                variation="link"
                size="small"
                style={{ padding: 0, zIndex: 5 }}
                onClick={handleAddToPlaylist}
              >
                <FaPlus color="#a0a0a0" />
              </Button>
            </Flex>
          </Flex>
        </div>
      </div>

      {/* Toujours inclure le modal, mais contrôlé par isOpen */}
      <AddToPlaylist 
        track={track} 
        isOpen={showAddToPlaylist} 
        onClose={() => setShowAddToPlaylist(false)} 
      />
    </>
  );
};

export default React.memo(TrackCard);