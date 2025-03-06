import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Flex, 
  Badge, 
  Button, 
  Image,
  View,
  Menu,
  MenuItem
} from '@aws-amplify/ui-react';
import { FaPlay, FaPause, FaDownload, FaMusic, FaPlus, FaEllipsisV } from 'react-icons/fa';
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
  displayStyle?: 'compact' | 'full';
}

/**
 * Composant pour afficher une carte de piste audio avec image de couverture
 * et option d'ajout à une playlist
 */
const TrackCardWithPlaylist: React.FC<TrackCardProps> = ({ 
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
  // État pour gérer l'ouverture du modal d'ajout à une playlist
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
  
  // Affichage compact pour les listes
  if (displayStyle === 'compact') {
    return (
      <>
        <Card
          padding="0.75rem"
          variation="outlined"
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
        >
          <Flex alignItems="center" gap="0.75rem">
            {/* Image de couverture */}
            <View position="relative" width="50px" height="50px">
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
              {/* Overlay de lecture sur l'image */}
              <Flex
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                backgroundColor="rgba(0,0,0,0.4)"
                alignItems="center"
                justifyContent="center"
                borderRadius="4px"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlay) onPlay();
                }}
              >
                {isCurrentTrack && isPlaying ? 
                  <FaPause color="white" size={16} /> : 
                  <FaPlay color="white" size={16} />
                }
              </Flex>
            </View>
            
            {/* Informations sur la piste */}
            <Flex direction="column" flex="1" gap="0.2rem">
              <Text fontWeight="bold" fontSize="0.9rem" isTruncated>{track.title}</Text>
              <Text 
                fontSize="0.8rem" 
                color="#a0a0a0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${track.user_id}`);
                }}
                style={{ cursor: 'pointer' }}
              >
                {track.artist || 'Artiste'}
              </Text>
            </Flex>
            
            {/* Badges */}
            <Flex direction="column" alignItems="flex-end" gap="0.25rem">
              <Badge variation="info" size="small">{track.genre}</Badge>
              {track.bpm && (
                <Text fontSize="0.7rem" color="#a0a0a0">{track.bpm} BPM</Text>
              )}
            </Flex>
            
            {/* Menu d'options */}
            <Menu
              trigger={
                <Button
                  variation="link"
                  onClick={(e) => e.stopPropagation()}
                  style={{ padding: '0.25rem' }}
                >
                  <FaEllipsisV color="#a0a0a0" />
                </Button>
              }
            >
              <MenuItem onClick={handleAddToPlaylist}>
                <FaPlus style={{ marginRight: '0.5rem' }} />
                Ajouter à une playlist
              </MenuItem>
            </Menu>
          </Flex>
        </Card>
        
        {/* Modal d'ajout à une playlist */}
        {showAddToPlaylist && (
          <AddToPlaylist 
            track={track} 
            isOpen={showAddToPlaylist} 
            onClose={() => setShowAddToPlaylist(false)} 
          />
        )}
      </>
    );
  }
  
  // Affichage complet standard
  return (
    <>
      <Card
        padding="1rem"
        variation="outlined"
        onClick={handleCardClick}
        style={{ cursor: 'pointer', overflow: 'hidden' }}
        borderRadius="8px"
        boxShadow="0 2px 5px rgba(0,0,0,0.1)"
      >
        <Flex gap="1rem">
          {/* Image de couverture */}
          <View position="relative" width="100px" height="100px">
            <Image
              src={coverImageSrc}
              alt={track.title}
              width="100px"
              height="100px"
              style={{ 
                objectFit: 'cover',
                borderRadius: '4px' 
              }}
              onError={() => setImageError(true)}
            />
            {/* Overlay de lecture sur l'image avec effet de hover */}
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              backgroundColor="rgba(0,0,0,0.4)"
              alignItems="center"
              justifyContent="center"
              borderRadius="4px"
              style={{ 
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onPlay) onPlay();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
              }}
            >
              {isCurrentTrack && isPlaying ? 
                <FaPause color="white" size={24} /> : 
                <FaPlay color="white" size={24} />
              }
            </Flex>
          </View>
          
          {/* Informations piste */}
          <Flex direction="column" flex="1" justifyContent="space-between">
            <Flex direction="column">
              <Text fontWeight="bold" fontSize="1.1rem">{track.title}</Text>
              <Text 
                fontSize="0.9rem" 
                color="#a0a0a0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${track.user_id}`);
                }}
                style={{ 
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3e1dfc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#a0a0a0';
                }}
              >
                {track.artist || 'Artiste'}
              </Text>
            </Flex>
            
            <Flex gap="0.5rem" wrap="wrap">
              <Badge variation="info">{track.genre}</Badge>
              {track.bpm && (
                <Badge variation="warning">{track.bpm} BPM</Badge>
              )}
              {track.tags && track.tags.length > 0 && track.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variation="success" size="small">{tag}</Badge>
              ))}
            </Flex>
            
            {/* Description (tronquée) si disponible */}
            {track.description && (
              <Text 
                fontSize="0.85rem" 
                color="#6c757d"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  marginTop: '0.5rem'
                }}
              >
                {track.description}
              </Text>
            )}
          </Flex>
          
          {/* Actions */}
          <Flex direction="column" justifyContent="space-between" gap="0.75rem">
            <Button
              onClick={handlePlayClick}
              variation="primary"
              size="small"
              gap="0.5rem"
              borderRadius="20px"
              backgroundColor="#3e1dfc"
              style={{
                transition: 'transform 0.2s ease, backgroundColor 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isCurrentTrack && isPlaying ? <FaPause /> : <FaPlay />}
              {isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              onClick={handleAddToPlaylist}
              variation="link"
              size="small"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaPlus /> Ajouter à une playlist
            </Button>
            
            <Flex justifyContent="space-between" gap="0.5rem" alignItems="center">
              {showLikeButton && (
                <LikeButton 
                  trackId={track.track_id}
                  likesCount={track.likes || 0}
                  size="small"
                  isCompact
                />
              )}
              
              <Flex gap="0.75rem">
                {!isInFavorites && track.downloads !== undefined && (
                  <Text fontSize="0.8rem" color="#a0a0a0">
                    <FaDownload style={{ marginRight: '4px' }} />
                    {track.downloads}
                  </Text>
                )}
                
                {track.duration && (
                  <Text fontSize="0.8rem" color="#a0a0a0">
                    {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Card>
      
      {/* Modal d'ajout à une playlist */}
      {showAddToPlaylist && (
        <AddToPlaylist 
          track={track} 
          isOpen={showAddToPlaylist} 
          onClose={() => setShowAddToPlaylist(false)} 
        />
      )}
    </>
  );
};

export default React.memo(TrackCardWithPlaylist);