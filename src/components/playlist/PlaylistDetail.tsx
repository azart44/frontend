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
  Image
} from '@aws-amplify/ui-react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlay, FaPause, FaEdit, FaTrash, FaLock, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { usePlaylist, useUpdatePlaylist, useDeletePlaylist } from '../../hooks/usePlaylists';
import { useAudioContext } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/AuthContext';
import { Playlist } from '../../types/PlaylistTypes';
import { Track } from '../../types/TrackTypes';
import PlaylistForm from './PlaylistForm';

/**
 * Composant pour afficher les détails d'une playlist avec drag-and-drop
 */
const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioContext();
  const [isEditing, setIsEditing] = useState(false);
  
  // Récupération de la playlist
  const { 
    data: playlist, 
    isLoading, 
    error,
    refetch 
  } = usePlaylist(playlistId);
  
  // Hooks de mutation
  const updatePlaylistMutation = useUpdatePlaylist();
  const deletePlaylistMutation = useDeletePlaylist();
  
  // Vérifier si l'utilisateur est propriétaire de la playlist
  const isOwner = playlist?.user_id === userId;
  
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
    
    // Mettre à jour les positions
    const updatedPositions: Record<string, number> = {};
    newTracks.forEach((track, index) => {
      updatedPositions[track.track_id] = index;
    });
    
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
      <Heading level={3} marginBottom="1rem">Pistes</Heading>
      
      {(!playlist.tracks || playlist.tracks.length === 0) && (
        <Card padding="2rem" textAlign="center">
          <Text>Aucune piste dans cette playlist.</Text>
          {isOwner && (
            <Button 
              onClick={() => navigate('/tracks')} 
              variation="primary"
              marginTop="1rem"
            >
              Ajouter des pistes
            </Button>
          )}
        </Card>
      )}
      
      {playlist.tracks && playlist.tracks.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playlist-tracks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {playlist.tracks.map((track, index) => (
                  <Draggable 
                    key={track.track_id} 
                    draggableId={track.track_id} 
                    index={index}
                    isDragDisabled={!isOwner}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          marginBottom: '0.75rem',
                          borderRadius: '8px',
                          backgroundColor: snapshot.isDragging ? '#f0f0f0' : 'transparent',
                          boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        <Card
                          padding="1rem"
                          variation="outlined"
                        >
                          <Flex gap="1rem" alignItems="center">
                            {/* Numéro de piste */}
                            <Text 
                              fontWeight="bold" 
                              fontSize="1.2rem"
                              width="1.5rem"
                              textAlign="center"
                            >
                              {index + 1}
                            </Text>
                            
                            {/* Image de couverture */}
                            <Image 
                              src={track.cover_image || '/default-cover.jpg'}
                              alt={track.title}
                              width="50px"
                              height="50px"
                              style={{ 
                                objectFit: 'cover',
                                borderRadius: '4px' 
                              }}
                            />
                            
                            {/* Informations de la piste */}
                            <Flex 
                              direction="column" 
                              flex="1"
                              gap="0.25rem"
                            >
                              <Text fontWeight="bold">{track.title}</Text>
                              <Text fontSize="0.8rem" color="#808080">
                                {track.artist || 'Artiste inconnu'} • {track.genre}
                              </Text>
                            </Flex>
                            
                            {/* Durée de la piste */}
                            {track.duration && (
                              <Text color="#808080">
                                {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
                              </Text>
                            )}
                            
                            {/* Boutons d'action */}
                            <Flex gap="0.5rem">
                              <Button
                                onClick={() => {
                                  if (currentTrack?.track_id === track.track_id) {
                                    togglePlay();
                                  } else {
                                    playTrack(track);
                                  }
                                }}
                                variation="primary"
                                size="small"
                                style={{
                                  borderRadius: '50%',
                                  width: '2rem',
                                  height: '2rem',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {currentTrack?.track_id === track.track_id && isPlaying ? (
                                  <FaPause size={14} />
                                ) : (
                                  <FaPlay size={14} />
                                )}
                              </Button>
                              
                              {isOwner && (
                                <Button
                                  onClick={() => handleRemoveTrack(track.track_id)}
                                  variation="link"
                                  size="small"
                                  style={{ color: 'red' }}
                                >
                                  <FaTrash size={14} />
                                </Button>
                              )}
                            </Flex>
                          </Flex>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </View>
  );
};

export default PlaylistDetail;