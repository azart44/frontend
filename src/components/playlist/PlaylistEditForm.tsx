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
  View,
  Divider,
  Loader,
  SearchField
} from '@aws-amplify/ui-react';
import { useForm } from '../../hooks/useForm';
import { Playlist, PlaylistFormData } from '../../types/PlaylistTypes';
import { useUpdatePlaylist, useDeletePlaylist } from '../../hooks/usePlaylists';
import { useSearchTracks } from '../../hooks/useTracks';
import { FaImage, FaMusic, FaPlus, FaTimes, FaSort, FaCheck, FaSave } from 'react-icons/fa';
import { Track } from '../../types/TrackTypes';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import ChordoraButton from '../common/ChordoraButton';
import { useAuth } from '../../contexts/AuthContext';

interface PlaylistEditFormProps {
  playlist: Playlist;
  onCancel: () => void;
  onSuccess: () => void;
}

/**
 * Formulaire d'édition de playlist avec interface similaire à la création
 */
const PlaylistEditForm: React.FC<PlaylistEditFormProps> = ({ 
  playlist, 
  onCancel, 
  onSuccess 
}) => {
  const { userId: authUserId } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // État pour la couverture
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    playlist.cover_image_url || null
  );
  
  // État pour l'ajout de pistes
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrackSearch, setShowTrackSearch] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>(
    (playlist.tracks || []).sort((a, b) => {
      const posA = playlist.track_positions?.[a.track_id] || 0;
      const posB = playlist.track_positions?.[b.track_id] || 0;
      return posA - posB;
    })
  );
  
  // Recherche de pistes filtrée par utilisateur courant uniquement
  const { 
    data: searchResults, 
    isLoading: isSearching 
  } = useSearchTracks(
    searchTerm ? { query: searchTerm, userId: authUserId } : { userId: authUserId }
  );
  
  // Filtrer les résultats pour n'afficher que les pistes de l'utilisateur courant
  const filteredResults = searchResults?.tracks?.filter(track => track.user_id === authUserId) || [];
  
  // Utilisation des hooks de mutation
  const updatePlaylistMutation = useUpdatePlaylist();
  const deletePlaylistMutation = useDeletePlaylist();
  
  // Initialisation du formulaire
  const { values, handleChange, errors, validate, setValues } = useForm<PlaylistFormData>({
    playlist_id: playlist.playlist_id,
    title: playlist.title,
    description: playlist.description || '',
    is_public: playlist.is_public !== false, // Par défaut public
    cover_image_url: playlist.cover_image_url || ''
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
  
  // Gérer le glisser-déposer des pistes
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedTracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedTracks(items);
  };
  
  // Ajouter une piste à la playlist
  const handleAddTrack = (track: Track) => {
    // Vérifier si la piste n'est pas déjà dans la sélection
    if (!selectedTracks.some(t => t.track_id === track.track_id)) {
      // Vérifier si l'utilisateur est propriétaire de la piste
      if (track.user_id === authUserId) {
        setSelectedTracks(prev => [...prev, track]);
      } else {
        setError("Vous ne pouvez ajouter à vos playlists que les pistes dont vous êtes le propriétaire.");
      }
    }
  };
  
  // Supprimer une piste de la playlist
  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks(prev => prev.filter(track => track.track_id !== trackId));
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
      playlist_id: playlist.playlist_id,
      tracks: selectedTracks.map((track, index) => ({
        track_id: track.track_id,
        position: index
      }))
    };
    
    // Ajouter l'image de couverture si présente
    if (coverImage) {
      // Dans une implémentation réelle, vous devriez uploader l'image sur S3
      // et obtenir l'URL. Pour l'exemple, nous utilisons l'URL de prévisualisation
      playlistData.cover_image_url = coverImagePreview || '';
    }
    
    try {
      // Mise à jour d'une playlist existante
      await updatePlaylistMutation.mutateAsync(playlistData);
      
      setSuccess(true);
      
      // Appeler le callback de succès après un court délai
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la playlist:', err);
      setError(err.message || 'Une erreur est survenue');
    }
  }, [values, validate, updatePlaylistMutation, onSuccess, selectedTracks, playlist.playlist_id, coverImage, coverImagePreview]);
  
  return (
    <Card padding="1.5rem">
      <Heading level={3} marginBottom="1rem">
        Modifier la playlist
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
          Playlist mise à jour avec succès
        </Alert>
      )}
      
      {/* Message d'information sur la restriction */}
      <Alert 
        variation="info" 
        heading="Information" 
        marginBottom="1.5rem"
      >
        Conformément aux règles de Chordora, vous ne pouvez ajouter à vos playlists que les pistes dont vous êtes le propriétaire.
      </Alert>
      
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
              <ChordoraButton 
                onClick={() => setShowTrackSearch(!showTrackSearch)}
                variation="primary"
              >
                <FaPlus style={{ marginRight: '0.5rem' }} />
                {showTrackSearch ? 'Masquer la recherche' : 'Ajouter des pistes'}
              </ChordoraButton>
            </Flex>
            
            {/* Recherche de pistes */}
            {showTrackSearch && (
              <Flex direction="column" gap="1rem" marginBottom="1.5rem">
                <SearchField
                  label="Rechercher parmi vos pistes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Titre, artiste, genre..."
                />
                
                <View 
                  backgroundColor="var(--chordora-card-bg)" 
                  padding="1rem"
                  borderRadius="8px"
                  maxHeight="300px"
                  overflow="auto"
                >
                  {isSearching ? (
                    <Flex justifyContent="center" padding="1rem">
                      <Loader size="small" />
                    </Flex>
                  ) : filteredResults.length > 0 ? (
                    <Flex direction="column" gap="0.5rem">
                      {filteredResults.map(track => (
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
                          
                          <ChordoraButton 
                            onClick={() => handleAddTrack(track)}
                            variation="primary"
                            size="small"
                            isDisabled={selectedTracks.some(t => t.track_id === track.track_id)}
                          >
                            {selectedTracks.some(t => t.track_id === track.track_id) ? (
                              <>
                                <FaCheck style={{ marginRight: '0.5rem' }} />
                                Ajoutée
                              </>
                            ) : (
                              <>
                                <FaPlus style={{ marginRight: '0.5rem' }} />
                                Ajouter
                              </>
                            )}
                          </ChordoraButton>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Text textAlign="center">
                      {searchTerm ? 'Aucune de vos pistes ne correspond à cette recherche' : 'Recherchez parmi vos pistes à ajouter'}
                    </Text>
                  )}
                </View>
              </Flex>
            )}
            
            {/* Liste des pistes avec drag & drop */}
            {selectedTracks.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="playlist-tracks">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        backgroundColor: 'var(--chordora-bg-secondary)',
                        borderRadius: '8px',
                        padding: '0.5rem'
                      }}
                    >
                      {selectedTracks.map((track, index) => (
                        <Draggable
                          key={track.track_id}
                          draggableId={track.track_id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom: '0.5rem',
                                backgroundColor: snapshot.isDragging 
                                  ? 'var(--chordora-hover-bg)' 
                                  : 'rgba(255,255,255,0.05)',
                                borderRadius: '4px'
                              }}
                            >
                              <Flex 
                                alignItems="center" 
                                padding="0.75rem" 
                                gap="0.75rem"
                              >
                                {/* Handle de glisser-déposer */}
                                <div
                                  {...provided.dragHandleProps}
                                  style={{ 
                                    cursor: 'grab',
                                    color: 'var(--chordora-text-secondary)'
                                  }}
                                >
                                  <FaSort />
                                </div>
                                
                                <Text fontWeight="bold" color="gray">{index + 1}</Text>
                                
                                <Flex alignItems="center" gap="0.5rem" flex="1">
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
                                
                                <ChordoraButton 
                                  onClick={() => handleRemoveTrack(track.track_id)}
                                  variation="danger"
                                  size="small"
                                  iconOnly
                                >
                                  <FaTimes />
                                </ChordoraButton>
                              </Flex>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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
                <ChordoraButton 
                  onClick={() => setShowTrackSearch(true)}
                  variation="link"
                  marginTop="0.5rem"
                >
                  Ajouter des pistes
                </ChordoraButton>
              </Flex>
            )}
          </Card>
          
          <Flex gap="1rem">
            <ChordoraButton 
              type="submit" 
              variation="primary"
              isLoading={updatePlaylistMutation.isPending}
            >
              <FaSave style={{ marginRight: '0.5rem' }} />
              Enregistrer les modifications
            </ChordoraButton>
            
            <ChordoraButton 
              onClick={onCancel} 
              variation="link"
            >
              Annuler
            </ChordoraButton>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default React.memo(PlaylistEditForm);
