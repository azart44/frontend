import React, { useState, useCallback } from 'react';
import { 
  Heading, 
  TextField, 
  TextAreaField, 
  SwitchField,
  Button, 
  Flex, 
  Alert, 
  Card,
  Image,
  Text,
  View
} from '@aws-amplify/ui-react';
import { useForm } from '../../hooks/useForm';
import { PlaylistFormData, Playlist } from '../../types/PlaylistTypes';
import { useCreatePlaylist, useUpdatePlaylist } from '../../hooks/usePlaylists';
import { useSearchTracks } from '../../hooks/useTracks';
import { FaImage, FaMusic, FaPlus } from 'react-icons/fa';
import { Track } from '../../types/TrackTypes';
import { useAuth } from '../../contexts/AuthContext';

interface PlaylistFormProps {
  initialData?: {
    playlist_id?: string;
    title?: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
    tracks?: { track_id: string; position?: number }[];
  };
  onSuccess?: (playlist: Playlist) => void;
  onCancel?: () => void;
}

/**
 * Formulaire pour créer ou éditer une playlist
 * Amélioré avec upload d'image et ajout de pistes
 */
const PlaylistForm: React.FC<PlaylistFormProps> = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEditing = !!initialData?.playlist_id;
  const { userId } = useAuth();
  
  // État pour la couverture
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialData?.cover_image_url || null
  );
  
  // État pour l'ajout de pistes
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrackSearch, setShowTrackSearch] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>(
    (initialData?.tracks?.map(t => ({ 
      track_id: t.track_id, 
      position: t.position || 0 
    } as Track)) || []) as Track[]
  );
  
  // Recherche de pistes - modification pour n'afficher que les pistes de l'utilisateur
  const { 
    data: searchResults, 
    isLoading: isSearching 
  } = useSearchTracks(
    searchTerm ? { query: searchTerm, userId: userId } : { userId: userId }
  );
  
  // Utilisation des hooks de mutation
  const createPlaylistMutation = useCreatePlaylist();
  const updatePlaylistMutation = useUpdatePlaylist();
  
  // Initialisation du formulaire
  const { values, handleChange, errors, validate, setValues } = useForm<PlaylistFormData>({
    playlist_id: initialData?.playlist_id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    is_public: initialData?.is_public !== false, // Par défaut public
    cover_image_url: initialData?.cover_image_url || '',
    tracks: initialData?.tracks || []
  });
  
  // Gérer l'upload d'image de couverture
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
        alert('Format d\'image non supporté. Utilisez JPG, PNG ou WEBP.');
        return;
      }
      
      setCoverImage(file);
      
      // Créer un URL pour la prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Ajouter une piste à la playlist
  const handleAddTrack = (track: Track) => {
    // Vérifier si la piste appartient à l'utilisateur
    if (track.user_id !== userId) {
      setError('Vous ne pouvez ajouter que vos propres pistes à vos playlists');
      return;
    }
    
    // Vérifier si la piste n'est pas déjà dans la sélection
    if (!selectedTracks.some(t => t.track_id === track.track_id)) {
      const newTracks = [...selectedTracks, track];
      setSelectedTracks(newTracks);
      
      // Mettre à jour les valeurs du formulaire
      setValues(prev => ({
        ...prev,
        tracks: newTracks.map((t, index) => ({
          track_id: t.track_id,
          position: index
        }))
      }));
    }
  };
  
  // Supprimer une piste de la playlist
  const handleRemoveTrack = (trackId: string) => {
    const newTracks = selectedTracks.filter(t => t.track_id !== trackId);
    setSelectedTracks(newTracks);
    
    // Mettre à jour les valeurs du formulaire
    setValues(prev => ({
      ...prev,
      tracks: newTracks.map((t, index) => ({
        track_id: t.track_id,
        position: index
      }))
    }));
  };
  
  // Gérer le changement de l'option "is_public"
  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, is_public: e.target.checked }));
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validation du formulaire
    const validationRules = {
      title: (value: string) => value ? null : 'Le titre est requis'
    };
    
    if (!validate(validationRules)) {
      return;
    }
    
    // Préparer les données de la playlist
    const playlistData: PlaylistFormData = {
      ...values,
      tracks: selectedTracks.map((track, index) => ({
        track_id: track.track_id,
        position: index
      }))
    };
    
    // Ajouter l'ID pour la mise à jour
    if (isEditing) {
      playlistData.playlist_id = initialData!.playlist_id;
    }
    
    // Ajouter l'image de couverture si présente
    if (coverImage) {
      // Dans une implémentation réelle, vous devriez uploader l'image sur S3
      // et obtenir l'URL. Pour l'exemple, nous utilisons l'URL de prévisualisation
      playlistData.cover_image_url = coverImagePreview || '';
    }
    
    try {
      if (isEditing) {
        // Mise à jour d'une playlist existante
        const response = await updatePlaylistMutation.mutateAsync(playlistData);
        if (onSuccess && response.data && response.data.playlist) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess(response.data.playlist);
          }, 1000);
        }
      } else {
        // Création d'une nouvelle playlist
        const response = await createPlaylistMutation.mutateAsync(playlistData);
        if (onSuccess && response.data && response.data.playlist) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess(response.data.playlist);
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde de la playlist:', err);
      setError(err.message || 'Une erreur est survenue');
    }
  }, [values, validate, isEditing, updatePlaylistMutation, createPlaylistMutation, onSuccess, selectedTracks, initialData, coverImage, coverImagePreview]);
  
  return (
    <Card padding="1.5rem">
      <Heading level={3} marginBottom="1rem">
        {isEditing ? 'Modifier la playlist' : 'Créer une playlist'}
      </Heading>
      
      {error && (
        <Alert 
          variation="error" 
          heading="Erreur" 
          marginBottom="1rem"
          isDismissible={true}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          variation="success" 
          heading="Succès" 
          marginBottom="1rem"
          isDismissible={true}
        >
          {isEditing ? 'Playlist mise à jour avec succès' : 'Playlist créée avec succès'}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1.5rem">
          {/* Section informations de base et image */}
          <Flex 
            direction={{ base: 'column', medium: 'row' }}
            gap="1.5rem"
            alignItems="flex-start"
          >
            {/* Image de couverture */}
            <Flex 
              direction="column" 
              alignItems="center" 
              gap="1rem"
              width={{ base: '100%', medium: '200px' }}
            >
              <View 
                backgroundColor={coverImagePreview ? 'transparent' : '#333'}
                width="200px"
                height="200px"
                borderRadius="8px"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--chordora-divider)'
                }}
              >
                {coverImagePreview ? (
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <FaImage size={48} color="#666" />
                )}
              </View>
              
              <label 
                htmlFor="cover-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--chordora-primary)',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                <FaImage style={{ marginRight: '0.5rem' }} />
                {coverImagePreview ? 'Changer l\'image' : 'Ajouter une image'}
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverImageChange}
                style={{ display: 'none' }}
              />
              <Text fontSize="0.8rem" color="gray">
                JPG, PNG ou WEBP, max 5Mo
              </Text>
            </Flex>
            
            {/* Champs du formulaire */}
            <Flex direction="column" gap="1rem" flex="1">
              <TextField
                label="Titre"
                name="title"
                value={values.title}
                onChange={handleChange}
                placeholder="Entrez un titre pour votre playlist"
                hasError={!!errors.title}
                errorMessage={errors.title}
                isRequired
              />
              
              <TextAreaField
                label="Description (optionnelle)"
                name="description"
                value={values.description}
                onChange={handleChange}
                placeholder="Décrivez votre playlist"
                rows={3}
              />
              
              <SwitchField
                label="Playlist publique"
                name="is_public"
                checked={values.is_public}
                onChange={handlePublicChange}
                labelPosition="end"
              />
            </Flex>
          </Flex>
          
          {/* Section pistes */}
          <Card padding="1.5rem">
            <Flex 
              justifyContent="space-between" 
              alignItems="center"
              marginBottom="1rem"
            >
              <Heading level={4}>Pistes ({selectedTracks.length})</Heading>
              <Button 
                onClick={() => setShowTrackSearch(!showTrackSearch)}
                variation="primary"
              >
                <FaPlus style={{ marginRight: '0.5rem' }} />
                Ajouter des pistes
              </Button>
            </Flex>
            
            {/* Message informatif pour indiquer la limitation */}
            <Text color="var(--chordora-text-secondary)" marginBottom="1rem" fontSize="0.9rem">
              Vous ne pouvez ajouter que vos propres pistes à votre playlist.
            </Text>
            
            {/* Recherche de pistes */}
            {showTrackSearch && (
              <Flex direction="column" gap="1rem" marginBottom="1.5rem">
                <TextField
                  label="Rechercher des pistes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Titre, genre..."
                />
                
                <View 
                  backgroundColor="var(--chordora-card-bg)" 
                  padding="1rem"
                  borderRadius="8px"
                  maxHeight="300px"
                  overflow="auto"
                >
                  {isSearching ? (
                    <Text textAlign="center">Recherche en cours...</Text>
                  ) : searchResults?.tracks && searchResults.tracks.length > 0 ? (
                    <Flex direction="column" gap="0.5rem">
                      {searchResults.tracks.map(track => (
                        <Flex 
                          key={track.track_id}
                          justifyContent="space-between"
                          alignItems="center"
                          padding="0.5rem"
                          backgroundColor="rgba(255,255,255,0.05)"
                          borderRadius="4px"
                        >
                          <Flex alignItems="center" gap="0.5rem">
                            <Image
                              src={track.cover_image || '/default-cover.jpg'}
                              alt={track.title}
                              width="40px"
                              height="40px"
                              style={{ borderRadius: '4px', objectFit: 'cover' }}
                            />
                            <Flex direction="column">
                              <Text fontWeight="bold">{track.title}</Text>
                              <Text fontSize="0.8rem" color="gray">{track.artist} • {track.genre}</Text>
                            </Flex>
                          </Flex>
                          
                          <Button 
                            onClick={() => handleAddTrack(track)}
                            variation="primary"
                            size="small"
                            isDisabled={selectedTracks.some(t => t.track_id === track.track_id)}
                          >
                            {selectedTracks.some(t => t.track_id === track.track_id) ? 'Ajoutée' : 'Ajouter'}
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Text textAlign="center">
                      {searchTerm ? 'Aucun résultat trouvé' : 'Recherchez des pistes à ajouter'}
                    </Text>
                  )}
                </View>
              </Flex>
            )}
            
            {/* Liste des pistes sélectionnées */}
            {selectedTracks.length > 0 ? (
              <Flex direction="column" gap="0.5rem">
                {selectedTracks.map((track, index) => (
                  <Flex 
                    key={track.track_id}
                    justifyContent="space-between"
                    alignItems="center"
                    padding="0.75rem"
                    backgroundColor="rgba(255,255,255,0.05)"
                    borderRadius="4px"
                  >
                    <Flex alignItems="center" gap="0.75rem">
                      <Text fontWeight="bold" color="gray">{index + 1}</Text>
                      
                      <Flex alignItems="center" gap="0.5rem">
                        <Image
                          src={track.cover_image || '/default-cover.jpg'}
                          alt={track.title}
                          width="40px"
                          height="40px"
                          style={{ borderRadius: '4px', objectFit: 'cover' }}
                        />
                        
                        <Flex direction="column">
                          <Text fontWeight="bold">{track.title}</Text>
                          <Text fontSize="0.8rem" color="gray">{track.artist || 'Artiste'} • {track.genre}</Text>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Button 
                      onClick={() => handleRemoveTrack(track.track_id)}
                      variation="link"
                      size="small"
                      style={{ color: 'red' }}
                    >
                      Retirer
                    </Button>
                  </Flex>
                ))}
              </Flex>
            ) : (
              <Flex 
                direction="column" 
                alignItems="center" 
                justifyContent="center"
                padding="2rem"
                backgroundColor="rgba(255,255,255,0.05)"
                borderRadius="8px"
              >
                <FaMusic size={32} color="#666" />
                <Text marginTop="1rem">
                  Aucune piste dans cette playlist
                </Text>
                <Button 
                  onClick={() => setShowTrackSearch(true)}
                  variation="link"
                  marginTop="0.5rem"
                >
                  Ajouter des pistes
                </Button>
              </Flex>
            )}
          </Card>
          
          <Flex gap="1rem">
            <Button 
              type="submit" 
              variation="primary"
              isLoading={createPlaylistMutation.isPending || updatePlaylistMutation.isPending}
            >
              {isEditing ? 'Mettre à jour' : 'Créer la playlist'}
            </Button>
            
            {onCancel && (
              <Button 
                onClick={onCancel} 
                variation="link"
              >
                Annuler
              </Button>
            )}
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default PlaylistForm;