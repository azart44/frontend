import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Loader,
  Card,
  TextField,
  SelectField,
  TextAreaField
} from '@aws-amplify/ui-react';
import { useUserTracks, useDeleteTrack, useUpdateTrack } from '../../hooks/useTracks';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';
import { useForm } from '../../hooks/useForm';
import { Track } from '../../types/TrackTypes';
import TrackCard from '../track/TrackCard';
import { FaEdit, FaTrash } from 'react-icons/fa';

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
  const { playTrack } = useAudioContext();
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
  
  // Fonction pour jouer une piste
  const handlePlayTrack = (track: Track) => {
    playTrack(track);
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
        <div key={track.track_id} style={{ marginBottom: '1.5rem' }}>
          {editingTrackId === track.track_id ? (
            <Card padding="1.5rem" borderRadius="8px">
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
            </Card>
          ) : (
            <Card style={{ overflow: 'hidden', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div className="track-card-container">
                {/* Utiliser TrackCard pour l'affichage cohérent */}
                <TrackCard 
                  track={track}
                  showLikeButton={true}
                  displayStyle="full"
                  onPlay={() => handlePlayTrack(track)}
                />
                
                {/* Boutons d'édition/suppression en dessous de la carte */}
                {canEdit && (
                  <Flex 
                    direction="row"
                    justifyContent="flex-end"
                    padding="0.75rem 1rem"
                    backgroundColor="rgba(0,0,0,0.03)"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <Button 
                      onClick={() => startEditing(track)} 
                      size="small"
                      variation="link"
                      marginRight="1.5rem"
                    >
                      <FaEdit style={{ marginRight: '5px' }} /> Modifier
                    </Button>
                    <Button 
                      onClick={() => handleDeleteTrack(track.track_id)} 
                      size="small"
                      variation="link"
                      style={{ color: "red" }}
                    >
                      <FaTrash style={{ marginRight: '5px' }} /> Supprimer
                    </Button>
                  </Flex>
                )}
              </div>
            </Card>
          )}
        </div>
      ))}
    </Flex>
  );
};

export default TrackList;