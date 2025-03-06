import React, { useState, useCallback } from 'react';
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
  TextField
} from '@aws-amplify/ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaPlay, 
  FaPause, 
  FaEdit, 
  FaTrash, 
  FaLock, 
  FaGlobe, 
  FaArrowLeft, 
  FaPlus,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { usePlaylist, useUpdatePlaylist, useDeletePlaylist } from '../../hooks/usePlaylists';
import { useAudioContext } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchTracks } from '../../hooks/useTracks';
import PlaylistForm from './PlaylistForm';
import CustomModal from '../common/CustomModal';
import TrackCard from '../track/TrackCard';
import { Track } from '../../types/TrackTypes';

/**
 * Composant pour afficher les détails d'une playlist avec drag-and-drop
 * Amélioré avec la possibilité d'ajouter des pistes
 */
const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddTracksModal, setShowAddTracksModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Récupération de la playlist
  const { 
    data: playlist, 
    isLoading, 
    error,
    refetch 
  } = usePlaylist(playlistId);
  
  // Recherche de pistes pour l'ajout
  const { 
    data: searchResults, 
    isLoading: isSearching 
  } = useSearchTracks(
    searchTerm ? { query: searchTerm } : {}
  );
  
  // Hooks de mutation
  const updatePlaylistMutation = useUpdatePlaylist();
  const deletePlaylistMutation = useDeletePlaylist();
  
  // Vérifier si l'utilisateur est propriétaire de la playlist
  const isOwner = playlist?.user_id === userId;
  
  // Récupérer les pistes déjà dans la playlist pour éviter les doublons
  const existingTrackIds = playlist?.tracks?.map(track => track.track_id) || [];
  
  // Gérer le glisser-déposer des pistes
  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!playlist || !playlist.tracks) return;
    
    const { source, destination } = result;
    
    // Si pas de destination ou même position, ne rien faire
    if (!destination || (
      source.index === destination.index && 
      source.droppableId === destination.droppableId
    )) {
      return;
    }
    
    // Copier les pistes pour manipulation
    const newTracks = [...playlist.tracks];
    
    // Enlever l'élément de sa position source
    const [movedTrack] = newTracks.splice(source.index, 1);
    
    // Insérer l'élément à sa nouvelle position
    newTracks.splice(destination.index, 0, movedTrack);
    
    // Créer le nouvel ordre des pistes
    const updatedTrackIds = newTracks.map(track => track.track_id);
    
    try {
      // Mise à jour de la playlist avec le nouvel ordre
      await updatePlaylistMutation.mutateAsync({
        playlist_id: playlist.playlist_id,
        title: playlist.title,
        description: playlist.description,
        is_public: playlist.is_public,
        cover_image_url: playlist.cover_image_url,
        tracks: updatedTrackIds.map((trackId, index) => ({
          track_id: trackId,
          position: index
        }))
      });
      
      // Rafraîchir les données
      refetch();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre des pistes:', error);
    }
  }, [playlist, updatePlaylistMutation, refetch]);
  
  // Ajouter une piste à la playlist
  const handleAddTrack = useCallback(async (track: Track) => {
    if (!playlist) return;
    
    // Vérifier si la piste n'est pas déjà dans la playlist
    if (existingTrackIds.includes(track.track_id)) {
      console.warn('Cette piste est déjà dans la playlist');
      return;
    }
    
    try {
      // Créer la nouvelle liste de pistes
      const updatedTracks = [...(playlist.tracks || []), track];
      const updatedTrackIds = updatedTracks.map(t => t.track_id);
      
      // Mise à jour de la playlist
      await updatePlaylistMutation.mutateAsync({
        playlist_id: playlist.playlist_id,
        title: playlist.title,
        description: playlist.description,
        is_public: playlist.is_public,
        cover_image_url: playlist.cover_image_url,
        tracks: updatedTrackIds.map((id, index) => ({
          track_id: id,
          position: index
        }))
      });
      
      // Fermer le modal et rafraîchir les données
      setShowAddTracksModal(false);
      setSearchTerm('');
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la piste:', error);
    }
  }, [playlist, existingTrackIds, updatePlaylistMutation, refetch]);
  
  // Supprimer une piste de la playlist
  const handleRemoveTrack = useCallback(async (trackId: string) => {
    if (!playlist) return;
    
    try {
      // Filtrer les pistes pour enlever celle à supprimer
      const updatedTracks = playlist.tracks?.filter(track => track.track_id !== trackId) || [];
      
      // Mettre à jour les positions
      const updatedTrackIds = updatedTracks.map(track => track.track_id);
      
      // Mise à jour de la playlist
      await updatePlaylistMutation.mutateAsync({
        playlist_id: playlist.playlist_id,
        title: playlist.title,
        description: playlist.description,
        is_public: playlist.is_public,
        cover_image_url: playlist.cover_image_url,
        tracks: updatedTrackIds.map((id, index) => ({
          track_id: id,
          position: index
        }))
      });
      
      // Rafraîchir les données
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression de la piste:', error);
    }
  }, [playlist, updatePlaylistMutation, refetch]);
  
  // Supprimer la playlist entière
  const handleDeletePlaylist = useCallback(async () => {
    if (!playlist) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la playlist "${playlist.title}" ?`)) {
      try {
        await deletePlaylistMutation.mutateAsync(playlist.playlist_id);
        // Rediriger vers la page des playlists
        navigate('/playlists');
      } catch (error) {
        console.error('Erreur lors de la suppression de la playlist:', error);
      }
    }
  }, [playlist, deletePlaylistMutation, navigate]);
  
  // Lire la playlist (première piste)
  const handlePlayPlaylist = useCallback(() => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
    
    // Jouer la première piste
    playTrack(playlist.tracks[0]);
  }, [playlist, playTrack]);
  
  // Afficher le formulaire d'édition
  if (isEditing && playlist) {
    return (
      <View>
        <Button 
          onClick={() => setIsEditing(false)} 
          variation="link"
          marginBottom="1rem"
        >
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Retour à la playlist
        </Button>
        
        <PlaylistForm 
          initialData={playlist}
          onSuccess={() => {
            setIsEditing(false);
            refetch();
          }}
          onCancel={() => setIsEditing(false)}
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
        <Text>Impossible de charger la playlist : {(error as Error).message}</Text>
        <Button 
          onClick={() => navigate('/playlists')} 
          variation="primary"
          marginTop="1rem"
        >
          Retour aux playlists
        </Button>
      </Card>
    );
  }
  
  // Afficher un message si la playlist n'est pas trouvée
  if (!playlist) {
    return (
      <Card padding="2rem">
        <Heading level={3}>Playlist non trouvée</Heading>
        <Button 
          onClick={() => navigate('/playlists')} 
          variation="primary"
          marginTop="1rem"
        >
          Retour aux playlists
        </Button>
      </Card>
    );
  }
  
  return (
    <View padding="1rem">
      {/* Bouton de retour */}
      <Button 
        onClick={() => navigate('/playlists')} 
        variation="link"
        marginBottom="1rem"
      >
        <FaArrowLeft style={{ marginRight: '0.5rem' }} />
        Toutes les playlists
      </Button>
      
      {/* En-tête de la playlist */}
      <Card padding="1.5rem" marginBottom="1.5rem">
        <Flex 
          direction={{ base: 'column', medium: 'row' }}
          gap="1.5rem"
          alignItems={{ base: 'flex-start', medium: 'center' }}
        >
          {/* Image de couverture */}
          <div 
            style={{ 
              width: '150px', 
              height: '150px',
              backgroundColor: '#f0f0f0',
              backgroundImage: playlist.cover_image_url ? `url(${playlist.cover_image_url})` : 'linear-gradient(to right, #3e1dfc, #87e54c)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px'
            }}
          />
          
          {/* Informations de la playlist */}
          <Flex 
            direction="column" 
            gap="0.5rem" 
            flex="1"
          >
            <Flex alignItems="center" gap="0.5rem">
              <Heading level={2}>{playlist.title}</Heading>
              <Badge variation={playlist.is_public ? "info" : "warning"}>
                {playlist.is_public ? <FaGlobe /> : <FaLock />}
                {playlist.is_public ? ' Public' : ' Privé'}
              </Badge>
            </Flex>
            
            {playlist.description && (
              <Text>{playlist.description}</Text>
            )}
            
            <Text fontSize="0.9rem" color="#808080">
              {playlist.track_count} {playlist.track_count === 1 ? 'piste' : 'pistes'}
            </Text>
            
            {/* Boutons d'action */}
            <Flex gap="1rem" marginTop="1rem">
              <Button 
                onClick={handlePlayPlaylist}
                variation="primary"
                isDisabled={!playlist.tracks || playlist.tracks.length === 0}
              >
                <FaPlay style={{ marginRight: '0.5rem' }} />
                Lire la playlist
              </Button>
              
              {isOwner && (
                <>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variation="menu"
                  >
                    <FaEdit style={{ marginRight: '0.5rem' }} />
                    Modifier
                  </Button>
                  
                  <Button 
                    onClick={handleDeletePlaylist}
                    variation="destructive"
                  >
                    <FaTrash style={{ marginRight: '0.5rem' }} />
                    Supprimer
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Card>
      
      {/* Liste des pistes avec drag-and-drop */}
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
        marginBottom="1rem"
      >
        <Heading level={3}>Pistes</Heading>
        
        {isOwner && (
          <Button 
            onClick={() => setShowAddTracksModal(true)}
            variation="primary"
          >
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Ajouter des pistes
          </Button>
        )}
      </Flex>
      
      {(!playlist.tracks || playlist.tracks.length === 0) && (
        <Card padding="2rem" textAlign="center">
          <Text>Aucune piste dans cette playlist.</Text>
          {isOwner && (
            <Button 
              onClick={() => setShowAddTracksModal(true)} 
              variation="primary"
              marginTop="1rem"
            >
              Ajouter des pistes
            </Button>
          )}
        </Card>
      )}
      
      {playlist.tracks && playlist.tracks.length > 0 && (
        <Card padding="0" backgroundColor="var(--chordora-card-bg)" borderRadius="8px">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist-tracks">
              {(provided: any) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {playlist.tracks?.map((track, index) => (
                    <Draggable 
                      key={track.track_id} 
                      draggableId={track.track_id} 
                      index={index}
                      isDragDisabled={!isOwner}
                    >
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            backgroundColor: snapshot.isDragging ? 'var(--chordora-hover-bg)' : 'transparent',
                          }}
                        >
                          {/* Utiliser le TrackCard avec style "row" */}
                          <TrackCard
                            track={{...track, position: index + 1}}
                            onPlay={() => {
                              if (currentTrack?.track_id === track.track_id) {
                                togglePlay();
                              } else {
                                playTrack(track);
                              }
                            }}
                            showLikeButton
                            displayStyle="row"
                          />
                          
                          {/* Bouton de suppression pour le propriétaire */}
                          {isOwner && (
                            <Flex 
                              justifyContent="flex-end" 
                              padding="0 1rem 0.5rem"
                            >
                              <Button
                                onClick={() => handleRemoveTrack(track.track_id)}
                                variation="link"
                                size="small"
                                style={{ color: 'red' }}
                              >
                                <FaTrash size={14} style={{ marginRight: '0.5rem' }} />
                                Retirer de la playlist
                              </Button>
                            </Flex>
                          )}
                          
                          {/* Ajouter un séparateur entre les pistes sauf pour la dernière */}
                          {playlist.tracks && index < playlist.tracks.length - 1 && !snapshot.isDragging && (
                            <div style={{ 
                              height: '1px', 
                              backgroundColor: 'var(--chordora-divider)',
                              margin: '0 1rem'
                            }} />
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      )}
      
      {/* Modal pour ajouter des pistes */}
      <CustomModal
        isOpen={showAddTracksModal}
        onClose={() => {
          setShowAddTracksModal(false);
          setSearchTerm('');
        }}
        title="Ajouter des pistes à la playlist"
        footer={
          <Button 
            onClick={() => {
              setShowAddTracksModal(false);
              setSearchTerm('');
            }}
            variation="primary"
          >
            Fermer
          </Button>
        }
      >
        <CustomModal.Body>
          <Flex direction="column" gap="1rem">
            <TextField
              placeholder="Rechercher des pistes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              variation="quiet"
              innerStartComponent={<FaSearch style={{ marginLeft: '0.5rem', color: 'gray' }} />}
              innerEndComponent={
                searchTerm ? (
                  <Button 
                    variation="link" 
                    onClick={() => setSearchTerm('')}
                    size="small"
                    padding="0 0.5rem"
                  >
                    <FaTimes />
                  </Button>
                ) : null
              }
            />
            
            {isSearching ? (
              <Flex justifyContent="center" padding="2rem">
                <Loader size="medium" />
              </Flex>
            ) : searchResults?.tracks && searchResults.tracks.length > 0 ? (
              <View 
                maxHeight="400px" 
                overflow="auto"
                padding="0.5rem"
              >
                <Flex direction="column" gap="0.5rem">
                  {searchResults.tracks.map(track => (
                    <Flex 
                      key={track.track_id}
                      justifyContent="space-between" 
                      alignItems="center"
                      backgroundColor="rgba(255,255,255,0.05)"
                      padding="0.75rem"
                      borderRadius="4px"
                    >
                      <Flex alignItems="center" gap="0.75rem">
                        <Image
                          src={track.cover_image || '/default-cover.jpg'}
                          alt={track.title}
                          width="40px"
                          height="40px"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <Flex direction="column">
                          <Text fontWeight="bold">{track.title}</Text>
                          <Flex alignItems="center" gap="0.5rem">
                            <Text fontSize="0.8rem" color="gray">{track.artist || 'Artiste'}</Text>
                            <Badge size="small">{track.genre}</Badge>
                          </Flex>
                        </Flex>
                      </Flex>
                      
                      <Button 
                        onClick={() => handleAddTrack(track)}
                        variation="primary"
                        size="small"
                        isDisabled={existingTrackIds.includes(track.track_id)}
                      >
                        {existingTrackIds.includes(track.track_id) ? 'Déjà ajoutée' : 'Ajouter'}
                      </Button>
                    </Flex>
                  ))}
                </Flex>
              </View>
            ) : (
              <Card padding="2rem" textAlign="center">
                <Text color="gray">
                  {searchTerm 
                    ? 'Aucune piste trouvée. Essayez d\'autres termes de recherche.'
                    : 'Recherchez des pistes à ajouter à votre playlist.'
                  }
                </Text>
              </Card>
            )}
          </Flex>
        </CustomModal.Body>
      </CustomModal>
    </View>
  );
};

export default PlaylistDetail;