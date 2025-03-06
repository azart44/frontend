import React, { useState, useEffect } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader, 
  Card, 
  Badge,
  Image,
  Alert,
  Divider 
} from '@aws-amplify/ui-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrackById, useDeleteTrack } from '../../hooks/useTracks';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';
import { 
  FaPlay, 
  FaPause, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaDownload, 
  FaHeart, 
  FaArrowLeft,
  FaUser 
} from 'react-icons/fa';
import LikeButton from '../common/LikeButton';
import AddToPlaylist from '../playlist/AddToPlaylist';
import TrackEditForm from './TrackEditForm';
import ChordoraButton from '../common/ChordoraButton';

interface TrackDetailProps {
  edit?: boolean;
}

/**
 * Composant pour afficher les détails d'une piste audio
 */
const TrackDetail: React.FC<TrackDetailProps> = ({ edit = false }) => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { currentTrack, isPlaying, togglePlay, playTrack } = useAudioContext();
  
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [isEditing, setIsEditing] = useState(edit);
  
  // Récupérer les détails de la piste
  const { 
    data: track, 
    isLoading, 
    error,
    refetch 
  } = useTrackById(trackId);
  
  // Mutation pour supprimer une piste
  const deleteTrackMutation = useDeleteTrack();
  
  // Vérifier si l'utilisateur est propriétaire de la piste
  const isOwner = track?.user_id === userId;
  
  // Définir l'état d'édition initial en fonction de la prop
  useEffect(() => {
    setIsEditing(edit);
  }, [edit]);
  
  // Gérer le clic sur le bouton de lecture
  const handlePlayClick = () => {
    if (!track) return;
    
    if (currentTrack?.track_id === track.track_id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };
  
  // Supprimer la piste
  const handleDeleteTrack = async () => {
    if (!track) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la piste "${track.title}" ?`)) {
      try {
        await deleteTrackMutation.mutateAsync(track.track_id);
        navigate('/profile');
      } catch (error) {
        console.error('Erreur lors de la suppression de la piste:', error);
      }
    }
  };
  
  // Formater la durée (secondes vers MM:SS)
  const formatTime = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Si en mode édition, afficher le formulaire d'édition
  if (isEditing && track) {
    return (
      <View>
        <Button 
          onClick={() => {
            setIsEditing(false);
            navigate(`/tracks/${trackId}`);
          }} 
          variation="link"
          marginBottom="1rem"
        >
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Retour à la piste
        </Button>
        
        <TrackEditForm 
          track={track}
          onSuccess={() => {
            setIsEditing(false);
            refetch();
            navigate(`/tracks/${trackId}`);
          }}
          onCancel={() => {
            setIsEditing(false);
            navigate(`/tracks/${trackId}`);
          }}
        />
      </View>
    );
  }
  
  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <Card padding="2rem">
        <Heading level={3} color="red">Erreur</Heading>
        <Text>Impossible de charger la piste : {(error as Error).message}</Text>
        <Button 
          onClick={() => navigate('/tracks')} 
          variation="primary"
          marginTop="1rem"
        >
          Retour aux pistes
        </Button>
      </Card>
    );
  }
  
  // Afficher un message si la piste n'est pas trouvée
  if (!track) {
    return (
      <Card padding="2rem">
        <Heading level={3}>Piste non trouvée</Heading>
        <Button 
          onClick={() => navigate('/tracks')} 
          variation="primary"
          marginTop="1rem"
        >
          Retour aux pistes
        </Button>
      </Card>
    );
  }
  
  return (
    <View padding="1rem">
      {/* Bouton de retour */}
      <Button 
        onClick={() => navigate('/tracks')} 
        variation="link"
        marginBottom="1rem"
      >
        <FaArrowLeft style={{ marginRight: '0.5rem' }} />
        Toutes les pistes
      </Button>
      
      <Card padding="1.5rem" marginBottom="1.5rem">
        <Flex 
          direction={{ base: 'column', medium: 'row' }}
          gap="1.5rem"
          alignItems={{ base: 'flex-start', medium: 'center' }}
        >
          {/* Image de couverture */}
          <div style={{ position: 'relative' }}>
            <Image
              src={track.cover_image || '/default-cover.jpg'}
              alt={track.title}
              width="150px"
              height="150px"
              style={{ 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            
            {/* Bouton de lecture sur l'image */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={handlePlayClick}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--chordora-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {currentTrack?.track_id === track.track_id && isPlaying ? (
                  <FaPause size={20} color="white" />
                ) : (
                  <FaPlay size={20} color="white" />
                )}
              </div>
            </div>
          </div>
          
          {/* Informations de la piste */}
          <Flex direction="column" gap="0.5rem" flex="1">
            <Heading level={2}>{track.title}</Heading>
            
            {/* Artiste (lien vers le profil) */}
            <Button 
              onClick={() => navigate(`/profile/${track.user_id}`)}
              variation="link"
              style={{ padding: 0, justifyContent: 'flex-start' }}
            >
              <FaUser style={{ marginRight: '0.5rem' }} />
              {track.artist || 'Artiste'}
            </Button>
            
            <Flex gap="0.5rem" wrap="wrap" marginTop="0.5rem">
              <Badge variation="info">{track.genre}</Badge>
              
              {track.bpm && (
                <Badge variation="warning">{track.bpm} BPM</Badge>
              )}
              
              {track.mood && (
                <Badge variation="success">{track.mood}</Badge>
              )}
            </Flex>
            
            {/* Tags */}
            {track.tags && track.tags.length > 0 && (
              <Flex gap="0.5rem" wrap="wrap" marginTop="0.5rem">
                {track.tags.map(tag => (
                  <Badge key={tag} variation="info" size="small">#{tag}</Badge>
                ))}
              </Flex>
            )}
            
            {/* Description */}
            {track.description && (
              <Text marginTop="1rem">
                {track.description}
              </Text>
            )}
            
            {/* Informations supplémentaires */}
            <Flex gap="1.5rem" marginTop="1rem" color="var(--chordora-text-secondary)">
              <Text fontSize="0.9rem">
                Durée: {formatTime(track.duration)}
              </Text>
              
              {track.created_at && (
                <Text fontSize="0.9rem">
                  Ajouté le: {new Date(track.created_at).toLocaleDateString()}
                </Text>
              )}
            </Flex>
            
            {/* Actions */}
            <Flex gap="1rem" marginTop="1.5rem">
              <ChordoraButton 
                onClick={handlePlayClick}
                variation="primary"
              >
                {currentTrack?.track_id === track.track_id && isPlaying ? (
                  <>
                    <FaPause style={{ marginRight: '0.5rem' }} />
                    Pause
                  </>
                ) : (
                  <>
                    <FaPlay style={{ marginRight: '0.5rem' }} />
                    Écouter
                  </>
                )}
              </ChordoraButton>
              
              <ChordoraButton 
                onClick={() => setShowAddToPlaylist(true)}
                variation="menu"
              >
                <FaPlus style={{ marginRight: '0.5rem' }} />
                Ajouter à une playlist
              </ChordoraButton>
              
              {/* Boutons d'édition et suppression pour le propriétaire */}
              {isOwner && (
                <>
                  <ChordoraButton 
                    onClick={() => setIsEditing(true)}
                    variation="menu"
                  >
                    <FaEdit style={{ marginRight: '0.5rem' }} />
                    Modifier
                  </ChordoraButton>
                  
                  <ChordoraButton 
                    onClick={handleDeleteTrack}
                    variation="danger"
                  >
                    <FaTrash style={{ marginRight: '0.5rem' }} />
                    Supprimer
                  </ChordoraButton>
                </>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Card>
      
      {/* Actions secondaires */}
      <Card padding="1rem" marginBottom="1.5rem">
        <Flex gap="1.5rem" justifyContent="center">
          <LikeButton 
            trackId={track.track_id}
            likesCount={track.likes || 0}
            showCount={true}
          />
          
          {track.downloads !== undefined && (
            <Flex alignItems="center" gap="0.5rem">
              <FaDownload color="var(--chordora-text-secondary)" />
              <Text>{track.downloads} téléchargements</Text>
            </Flex>
          )}
          
          {track.plays !== undefined && (
            <Flex alignItems="center" gap="0.5rem">
              <FaPlay color="var(--chordora-text-secondary)" />
              <Text>{track.plays} écoutes</Text>
            </Flex>
          )}
        </Flex>
      </Card>
      
      {/* Commentaires et autres sections pourraient être ajoutés ici */}
      
      {/* Modal d'ajout à une playlist */}
      <AddToPlaylist 
        track={track} 
        isOpen={showAddToPlaylist} 
        onClose={() => setShowAddToPlaylist(false)} 
      />
    </View>
  );
};

export default TrackDetail;