import React, { useState, useCallback } from 'react';
import { 
  Heading, 
  TextField, 
  TextAreaField, 
  SwitchField,
  Button, 
  Flex, 
  Alert, 
  Card
} from '@aws-amplify/ui-react';
import { useForm } from '../../hooks/useForm';
import { PlaylistFormData, Playlist } from '../../types/PlaylistTypes';
import { useCreatePlaylist, useUpdatePlaylist } from '../../hooks/usePlaylists';

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
 */
const PlaylistForm: React.FC<PlaylistFormProps> = ({ 
  initialData, 
  onSuccess, 
  onCancel 
}) => {
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!initialData?.playlist_id;
  
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
  
  // Gestion de la soumission du formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation du formulaire
    const validationRules = {
      title: (value: string) => value ? null : 'Le titre est requis'
    };
    
    if (!validate(validationRules)) {
      return;
    }
    
    try {
      if (isEditing) {
        // Mise à jour d'une playlist existante
        const response = await updatePlaylistMutation.mutateAsync(values);
        if (onSuccess && response.data && response.data.playlist) {
          onSuccess(response.data.playlist);
        }
      } else {
        // Création d'une nouvelle playlist
        const response = await createPlaylistMutation.mutateAsync(values);
        if (onSuccess && response.data && response.data.playlist) {
          onSuccess(response.data.playlist);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde de la playlist:', err);
      setError(err.message || 'Une erreur est survenue');
    }
  }, [values, validate, isEditing, updatePlaylistMutation, createPlaylistMutation, onSuccess]);
  
  // Gérer le changement de l'option "is_public"
  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, is_public: e.target.checked }));
  };
  
  return (
    <Card padding="1.5rem">
      <Heading level={3} marginBottom="1rem">
        {isEditing ? 'Modifier la playlist' : 'Créer une nouvelle playlist'}
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
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1rem">
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
          
          <Flex gap="1rem" marginTop="1rem">
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