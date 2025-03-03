import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Heading, 
  Flex, 
  Badge, 
  Button, 
  TextField, 
  SelectField,
  Loader,
  View,
  TextAreaField
} from '@aws-amplify/ui-react';
import { FaPlay, FaPause, FaEdit, FaTrash, FaVolumeUp } from 'react-icons/fa';
import { useUserTracks, useDeleteTrack, useUpdateTrack } from '../../hooks/useTracks';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';
import { useForm } from '../../hooks/useForm';
import { Track } from '../../types/TrackTypes';
import LikeButton from '../common/LikeButton';

interface TrackListProps {
  userId: string;
  filters?: Record<string, string>;
}

/**
 * Composant pour afficher la liste des pistes audio d'un utilisateur
 * avec options de lecture, modification et suppression
 */
const TrackList: React.FC<TrackListProps> = ({ userId, filters = {} }) => {
  const { userId: currentUserId } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioContext();
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  
  // Utiliser les hooks personnalisés pour les données et les mutations
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useUserTracks(userId, filters);
  
  const deleteTrackMutation = useDeleteTrack();
  const updateTrackMutation = useUpdateTrack();
  
  // Formulaire pour l'édition d'une piste
  const { 
    values: editValues, 
    handleChange: handleEditChange, 
    setValues: setEditValues
  } = useForm<Partial<Track>>({
    title: '',
    genre: '',
    bpm: 0,
    description: ''
  });
  
  // Gérer la lecture audio en utilisant le contexte audio
  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.track_id === track.track_id) {
      // Si c'est la piste actuelle, simplement basculer lecture/pause
      togglePlay();
    } else {
      // Sinon, charger et jouer la nouvelle piste
      playTrack(track);
    }
  };
  
  // Initialiser le formulaire d'édition
  const startEditing = (track: Track) => {
    setEditValues({
      title: track.title,
      genre: track.genre,
      bpm: track.bpm,
      description: track.description || ''
    });
    setEditingTrackId(track.track_id);
  };
  
  // Annuler l'édition
  const cancelEditing = () => {
    setEditingTrackId(null);
  };
  
  // Sauvegarder les modifications
  const saveTrackEdit = async (trackId: string) => {
    try {
      await updateTrackMutation.mutateAsync({
        trackId,
        data: editValues
      });
      setEditingTrackId(null);
      // Rafraîchir les données
      refetch();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };
  
  // Supprimer une piste
  const handleDeleteTrack = async (trackId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette piste ?')) {
      try {
        await deleteTrackMutation.mutateAsync(trackId);
        // Rafraîchir les données
        refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };
  
  // États de chargement et d'erreur
  if (isLoading) return (
    <Flex justifyContent="center" padding="2rem">
      <Loader size="large" />
    </Flex>
  );
  
  if (error) return (
    <Text color="red">Erreur lors du chargement des pistes: {String(error)}</Text>
  );
  
  // Extraire les pistes du résultat de la requête
  const tracks = data?.tracks || [];
  
  if (tracks.length === 0) return (
    <Card padding="2rem" textAlign="center">
      <Text>Aucune piste trouvée</Text>
      {userId === currentUserId && (
        <Button 
          onClick={() => window.location.href = '/add-track'} 
          variation="primary"
          marginTop="1rem"
        >
          Ajouter une piste
        </Button>
      )}
    </Card>
  );
  
  // Déterminer si l'utilisateur peut modifier les pistes
  const canEdit = userId === currentUserId;
  
  return (
    <Flex direction="column" gap="1rem">
      {tracks.map((track: Track) => (
        <Card key={track.track_id} padding="1rem" variation="outlined">
          {editingTrackId === track.track_id ? (
            <Flex direction="column" gap="1rem">
              <TextField
                label="Titre"
                name="title"
                value={editValues.title}
                onChange={handleEditChange}
                required
              />
              <SelectField
                label="Genre"
                name="genre"
                value={editValues.genre}
                onChange={handleEditChange}
              >
                <option value="Drill">Drill</option>
                <option value="Trap">Trap</option>
                <option value="Boom Bap">Boom Bap</option>
                <option value="RnB">RnB</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Electronic">Electronic</option>
                <option value="Autre">Autre</option>
              </SelectField>
              <TextField
                label="BPM"
                name="bpm"
                type="number"
                value={editValues.bpm?.toString() || ''}
                onChange={handleEditChange}
              />
              <TextAreaField
                label="Description"
                name="description"
                value={editValues.description || ''}
                onChange={handleEditChange}
                rows={3}
              />
              <Flex gap="1rem">
                <Button 
                  onClick={() => saveTrackEdit(track.track_id)}
                  variation="primary"
                  isLoading={updateTrackMutation.isPending}
                >
                  Sauvegarder
                </Button>
                <Button onClick={cancelEditing} variation="warning">
                  Annuler
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" gap="0.5rem">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading level={4}>{track.title}</Heading>
                
                {canEdit && (
                  <Flex gap="0.5rem">
                    <Button 
                      onClick={() => startEditing(track)} 
                      size="small"
                      variation="link"
                    >
                      <FaEdit /> Modifier
                    </Button>
                    <Button 
                      onClick={() => handleDeleteTrack(track.track_id)} 
                      size="small"
                      variation="link"
                      style={{ color: "red" }}
                    >
                      <FaTrash /> Supprimer
                    </Button>
                  </Flex>
                )}
              </Flex>
              
              <Flex gap="0.5rem" marginTop="0.5rem" wrap="wrap">
                <Badge variation="info">{track.genre}</Badge>
                {track.bpm && <Badge variation="warning">{track.bpm} BPM</Badge>}
                {track.created_at && (
                  <Badge variation="info">
                    {new Date(Number(track.created_at) * 1000).toLocaleDateString()}
                  </Badge>
                )}
                {track.isPrivate && <Badge variation="error">Privé</Badge>}
              </Flex>
              
              {track.description && (
                <Text marginTop="0.5rem" fontSize="0.9rem">{track.description}</Text>
              )}
              
              <Flex 
                marginTop="0.5rem" 
                alignItems="center" 
                padding="0.5rem"
                backgroundColor="#f0f0f0"
                borderRadius="4px"
                justifyContent="space-between"
              >
                <Button 
                  onClick={() => handlePlayTrack(track)}
                  variation="primary"
                  size="small"
                  gap="0.5rem"
                >
                  {currentTrack?.track_id === track.track_id && isPlaying ? (
                    <>
                      <FaPause /> Pause
                    </>
                  ) : (
                    <>
                      <FaPlay /> Écouter
                    </>
                  )}
                </Button>
                
                <Flex alignItems="center" gap="1rem">
                  {/* Afficher le bouton Like pour tous les utilisateurs */}
                  <LikeButton 
                    trackId={track.track_id} 
                    likesCount={track.likes || 0}
                    showCount={true}
                  />
                  
                  {currentTrack?.track_id === track.track_id && isPlaying && (
                    <Flex 
                      alignItems="center" 
                      gap="0.5rem" 
                      style={{ 
                        animation: 'pulse 1.5s infinite' 
                      }}
                    >
                      <FaVolumeUp />
                      <Text>Lecture en cours...</Text>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Flex>
          )}
        </Card>
      ))}
    </Flex>
  );
};

export default TrackList;