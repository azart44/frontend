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
  TextAreaField,
  Image,
  Alert
} from '@aws-amplify/ui-react';
import { useUserTracks, useDeleteTrack, useUpdateTrack } from '../../hooks/useTracks';
import { useAuth } from '../../contexts/AuthContext';
import { useAudioContext } from '../../contexts/AudioContext';
import { useForm } from '../../hooks/useForm';
import { Track } from '../../types/TrackTypes';
import TrackCard from './TrackCard'; // Importe le composant TrackCard amélioré
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface TrackListProps {
  userId: string;
  filters?: Record<string, string>;
  onRefresh?: () => void;
}

// Interface d'édition de piste étendue
interface EditableTrack extends Partial<Track> {
  coverImageBase64?: string | null;
  coverImageType?: string | null;
}

/**
 * Composant pour afficher la liste des pistes audio d'un utilisateur
 * avec options de lecture, modification et suppression via un menu discret
 */
const TrackList: React.FC<TrackListProps> = ({ userId, filters = {}, onRefresh }) => {
  const navigate = useNavigate();
  const { userId: currentUserId } = useAuth();
  const { playTrack } = useAudioContext();
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  
  // État pour l'aperçu de l'image de couverture
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
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
  } = useForm<EditableTrack>({
    title: '',
    genre: '',
    bpm: 0,
    description: '',
    coverImageBase64: null,
    coverImageType: null
  });
  
  // Initialiser le formulaire d'édition
  const startEditing = (track: Track) => {
    setEditValues({
      title: track.title,
      genre: track.genre,
      bpm: track.bpm,
      description: track.description || '',
      coverImageBase64: null,
      coverImageType: null
    });
    setCoverImagePreview(track.cover_image || null);
    setEditingTrackId(track.track_id);
  };
  
  // Annuler l'édition
  const cancelEditing = () => {
    setEditingTrackId(null);
    setCoverImagePreview(null);
  };
  
  // Gérer l'upload d'une nouvelle image de couverture
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 5 Mo)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      
      // Vérifier le format
      const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!acceptedFormats.includes(file.type)) {
        alert('Format non supporté. Utilisez JPG, PNG ou WEBP.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Mettre à jour l'état
        setEditValues(prev => ({ 
          ...prev, 
          coverImageBase64: base64String,
          coverImageType: file.type
        }));
        setCoverImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Sauvegarder les modifications
  const saveTrackEdit = async (trackId: string) => {
    try {
      // Préparation des données de base à envoyer à l'API
      const trackData: Record<string, any> = {
        title: editValues.title,
        genre: editValues.genre,
        bpm: editValues.bpm,
        description: editValues.description
      };
      
      // Ajouter l'image de couverture seulement si elle a été changée
      if (editValues.coverImageBase64) {
        trackData.coverImageBase64 = editValues.coverImageBase64;
        
        // Utiliser le type déjà stocké ou l'extraire du base64
        if (editValues.coverImageType) {
          trackData.coverImageType = editValues.coverImageType;
        } else if (editValues.coverImageBase64.includes(';base64,')) {
          // Extraire le type MIME du format data:image/type;base64,...
          const mimeType = editValues.coverImageBase64.split(';')[0].split(':')[1];
          trackData.coverImageType = mimeType;
        }
      }
      
      await updateTrackMutation.mutateAsync({
        trackId,
        data: trackData
      });
      
      setEditingTrackId(null);
      setCoverImagePreview(null);
      
      // Rafraîchir les données
      await refetch();
      
      // Notifier le parent du rafraîchissement si la fonction est fournie
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };
  
  // Supprimer une piste
  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrackMutation.mutateAsync(trackId);
      
      // Rafraîchir les données
      await refetch();
      
      // Notifier le parent du rafraîchissement si la fonction est fournie
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
          onClick={() => navigate('/add-track')} 
          variation="primary"
          marginTop="1rem"
        >
          <FaPlus style={{ marginRight: '0.5rem' }} />
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
                
                {/* Section pour l'image de couverture */}
                <Flex direction="column" gap="1rem" marginTop="1rem">
                  <Text fontWeight="bold">Image de couverture</Text>
                  
                  {/* Aperçu de l'image actuelle ou nouvelle */}
                  {coverImagePreview && (
                    <Flex direction="column" alignItems="center" marginBottom="1rem">
                      <Image
                        src={coverImagePreview}
                        alt="Aperçu de la couverture"
                        width="200px"
                        height="200px"
                        objectFit="cover"
                        borderRadius="8px"
                      />
                    </Flex>
                  )}
                  
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverImageChange}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <Text fontSize="small" color="gray">
                    Formats acceptés: JPG, PNG, WEBP. Max: 5Mo
                  </Text>
                </Flex>
                
                <Flex gap="1rem" marginTop="1.5rem">
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
            <TrackCard 
              track={track}
              onPlay={() => handlePlayTrack(track)}
              showLikeButton={true}
              displayStyle="row"
              onEdit={canEdit ? startEditing : undefined}
              onDelete={canEdit ? handleDeleteTrack : undefined}
            />
          )}
        </div>
      ))}
    </Flex>
  );
};

export default TrackList;