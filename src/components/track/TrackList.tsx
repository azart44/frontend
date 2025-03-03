import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Heading, 
  Flex, 
  Badge, 
  Button, 
  TextField, 
  SelectField,
  Loader
} from '@aws-amplify/ui-react';
import { FaPlay, FaPause, FaEdit, FaTrash } from 'react-icons/fa';
import { useUserTracks, useDeleteTrack, useUpdateTrack } from '../../hooks/useTracks';
import { getTrackAudioUrl } from '../../api/track';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { Track } from '../../types/TrackTypes';

interface TrackListProps {
  userId: string;
}

const TrackList: React.FC<TrackListProps> = ({ userId }) => {
  const { userId: currentUserId } = useAuth();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackUrls, setTrackUrls] = useState<{[key: string]: string}>({});
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { 
    data: tracks, 
    isLoading, 
    error
  } = useUserTracks(userId);
  
  const deleteTrackMutation = useDeleteTrack();
  const updateTrackMutation = useUpdateTrack();
  
  const { 
    values: editValues, 
    handleChange: handleEditChange, 
    setValues: setEditValues
  } = useForm<Partial<Track>>({
    title: '',
    genre: '',
    bpm: 0
  });

  // Charger les URL des pistes
  useEffect(() => {
    const fetchTrackUrls = async () => {
      if (tracks && tracks.length > 0) {
        setIsLoadingUrls(true);
        const urls: {[key: string]: string} = {};
        
        try {
          for (const track of tracks) {
            if (track.file_path) {
              try {
                const url = await getTrackAudioUrl(track.file_path);
                urls[track.track_id] = url.toString();
              } catch (error) {
                console.error(`Erreur de récupération URL pour ${track.track_id}:`, error);
              }
            }
          }
          
          setTrackUrls(urls);
        } catch (error) {
          console.error('Erreur lors de la récupération des URLs de pistes:', error);
        } finally {
          setIsLoadingUrls(false);
        }
      }
    };

    fetchTrackUrls();
  }, [tracks]);
  
  // Gérer la lecture audio
  const togglePlay = async (trackId: string) => {
    // Récupérer l'URL de la piste
    const trackUrl = trackUrls[trackId];
    
    if (!trackUrl) {
      console.error('URL de piste non disponible');
      return;
    }

    if (currentlyPlaying === trackId) {
      // Arrêter la lecture
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      // Démarrer la lecture
      if (audioRef.current) {
        audioRef.current.src = trackUrl;
        try {
          await audioRef.current.play();
          setCurrentlyPlaying(trackId);
        } catch (error) {
          console.error('Erreur de lecture audio:', error);
          alert('Impossible de lire ce fichier audio');
        }
      }
    }
  };
  
  // Initialiser le formulaire d'édition
  const startEditing = (track: Track) => {
    setEditValues({
      title: track.title,
      genre: track.genre,
      bpm: track.bpm
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
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };
  
  // Supprimer une piste
  const handleDeleteTrack = async (trackId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette piste ?')) {
      try {
        await deleteTrackMutation.mutateAsync(trackId);
        // Si la piste en cours de lecture est supprimée, arrêter la lecture
        if (currentlyPlaying === trackId && audioRef.current) {
          audioRef.current.pause();
          setCurrentlyPlaying(null);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };
  
  // Arrêter la lecture si le composant est démonté
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);
  
  // États de chargement et d'erreur
  if (isLoading || isLoadingUrls) return <Loader />;
  if (error) return <Text color="red">Erreur lors du chargement des pistes</Text>;
  if (!tracks || tracks.length === 0) return <Text>Aucune piste trouvée</Text>;
  
  // Déterminer si l'utilisateur peut modifier les pistes
  const canEdit = userId === currentUserId;
  
  return (
    <Flex direction="column" gap="1rem">
      {tracks.map((track: Track) => (
        <Card key={track.track_id}>
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
              </SelectField>
              <TextField
                label="BPM"
                name="bpm"
                type="number"
                value={editValues.bpm?.toString()}
                onChange={handleEditChange}
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
                <Heading level={3}>{track.title}</Heading>
                
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
              
              <Flex gap="0.5rem" marginTop="0.5rem">
                <Badge variation="info">{track.genre}</Badge>
                <Badge variation="warning">{track.bpm} BPM</Badge>
                {track.created_at && (
                  <Badge variation="info">
                    {new Date(track.created_at).toLocaleDateString()}
                  </Badge>
                )}
              </Flex>
              
              <Button 
                onClick={() => togglePlay(track.track_id)}
                marginTop="0.5rem"
                variation="primary"
                gap="0.5rem"
                isDisabled={!trackUrls[track.track_id]}
              >
                {currentlyPlaying === track.track_id ? (
                  <>
                    <FaPause /> Pause
                  </>
                ) : (
                  <>
                    <FaPlay /> Écouter
                  </>
                )}
              </Button>
            </Flex>
          )}
        </Card>
      ))}
      
      {/* Lecteur audio caché */}
      <audio 
        ref={audioRef} 
        onEnded={() => setCurrentlyPlaying(null)}
        style={{ display: 'none' }}
      />
    </Flex>
  );
};

export default React.memo(TrackList);