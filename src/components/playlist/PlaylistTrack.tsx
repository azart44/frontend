import React, { useState } from 'react';
import { 
  Text, 
  Flex, 
  Button, 
  Image,
  Badge
} from '@aws-amplify/ui-react';
import { 
  FaPlay, 
  FaPause, 
  FaTrash, 
  FaEdit,
  FaEllipsisH
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Track } from '../../types/TrackTypes';
import { useAudioContext } from '../../contexts/AudioContext';
import LikeButton from '../common/LikeButton';
import AddToPlaylist from '../playlist/AddToPlaylist';
import { FaPlus } from 'react-icons/fa';

interface PlaylistTrackProps {
  track: Track;
  position?: number;
  isEditable?: boolean;
  onRemove?: (trackId: string) => void;
  onEdit?: (track: Track) => void;
}

const PlaylistTrack: React.FC<PlaylistTrackProps> = ({
  track, 
  position,
  isEditable = false,
  onRemove,
  onEdit
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioContext();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Déterminer si cette piste est actuellement en cours de lecture
  const isCurrentTrack = currentTrack?.track_id === track.track_id;

  // Formater la durée de la piste
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Gérer la lecture de la piste
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  // Naviguer vers la page de détail de la piste
  const handleTrackClick = () => {
    navigate(`/tracks/${track.track_id}`);
  };

  // Naviguer vers le profil de l'artiste
  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.user_id) {
      navigate(`/profile/${track.user_id}`);
    }
  };

  // Image de couverture avec fallback
  const coverImage = !imageError && track.cover_image 
    ? track.cover_image 
    : "/default-cover.jpg";

  return (
    <>
      <Flex 
        alignItems="center" 
        padding="0.75rem" 
        gap="1rem"
        backgroundColor="var(--chordora-card-bg)"
        style={{ 
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--chordora-card-bg)';
        }}
        onClick={handleTrackClick}
      >
        {/* Position/Play Button */}
        <Flex 
          alignItems="center" 
          justifyContent="center" 
          width="40px"
          onClick={handlePlayClick}
        >
          {position !== undefined ? (
            <Text color="var(--chordora-text-secondary)">
              {position}
            </Text>
          ) : (
            <Button 
              variation="link"
              style={{ 
                color: isCurrentTrack && isPlaying ? 'var(--chordora-secondary)' : 'var(--chordora-text-secondary)' 
              }}
            >
              {isCurrentTrack && isPlaying ? <FaPause /> : <FaPlay />}
            </Button>
          )}
        </Flex>

        {/* Track Image */}
        <Image
          src={coverImage}
          alt={track.title}
          width="50px"
          height="50px"
          style={{ 
            objectFit: 'cover',
            borderRadius: '4px'
          }}
          onError={() => setImageError(true)}
        />

        {/* Track Info */}
        <Flex direction="column" flex="1">
          <Text 
            fontWeight="bold"
            color={isCurrentTrack ? "var(--chordora-secondary)" : "var(--chordora-text-primary)"}
          >
            {track.title}
          </Text>
          <Text 
            fontSize="0.8rem" 
            color="var(--chordora-text-secondary)"
            onClick={handleArtistClick}
            style={{ cursor: 'pointer' }}
          >
            {track.artist || 'Artiste'}
          </Text>
        </Flex>

        {/* Track Metadata */}
        <Flex alignItems="center" gap="0.5rem">
          {track.genre && (
            <Badge variation="info" size="small">
              {track.genre}
            </Badge>
          )}
          {track.bpm && (
            <Text color="var(--chordora-text-secondary)" fontSize="0.8rem">
              {track.bpm} BPM
            </Text>
          )}
        </Flex>

        {/* Track Duration */}
        <Text color="var(--chordora-text-secondary)" width="60px" textAlign="right">
          {formatDuration(track.duration)}
        </Text>

        {/* Actions */}
        <Flex alignItems="center" gap="0.5rem">
          <LikeButton 
            trackId={track.track_id}
            likesCount={track.likes || 0}
            size="small"
            isCompact
          />

          <Button
            variation="link"
            size="small"
            style={{ padding: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddToPlaylist(true);
            }}
          >
            <FaPlus color="var(--chordora-text-secondary)" />
          </Button>

          {isEditable && (
            <Flex gap="0.5rem">
              <Button
                variation="link"
                size="small"
                style={{ padding: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(track);
                }}
              >
                <FaEdit color="var(--chordora-text-secondary)" />
              </Button>
              <Button
                variation="link"
                size="small"
                style={{ 
                  padding: 0,
                  color: 'var(--chordora-error)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove && onRemove(track.track_id);
                }}
              >
                <FaTrash />
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>

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

export default React.memo(PlaylistTrack);