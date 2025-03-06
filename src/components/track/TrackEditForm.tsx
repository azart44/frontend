import React, { useState, useCallback, useEffect } from 'react';
import { 
  Heading, 
  TextField, 
  SelectField, 
  Button, 
  Flex, 
  Alert, 
  Card,
  Image,
  Text,
  View,
  SwitchField,
  TextAreaField
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaMusic, FaImage, FaPlus, FaSave } from 'react-icons/fa';
import { useUpdateTrack } from '../../hooks/useTracks';
import { useForm } from '../../hooks/useForm';
import { MUSIC_GENRES, MUSIC_MOODS } from '../../constants/profileData';
import { Track } from '../../types/TrackTypes';
import ChordoraButton from '../common/ChordoraButton';

// Formats d'images acceptés
const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
// Taille maximale d'image (5 Mo)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface TrackEditFormProps {
  track: Track;
  onCancel: () => void;
  onSuccess: () => void;
}

const TrackEditForm: React.FC<TrackEditFormProps> = ({ track, onCancel, onSuccess }) => {
  const navigate = useNavigate();
  
  // États pour l'image de couverture
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(track.cover_image || null);
  
  // États pour la gestion des erreurs et du formulaire
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Hook pour mettre à jour une piste
  const updateTrackMutation = useUpdateTrack();
  
  // Formulaire avec validation
  const { 
    values, 
    handleChange, 
    errors, 
    validate, 
    setValues 
  } = useForm<{
    title: string;
    genre: string;
    bpm: number;
    description: string;
    mood: string;
    tags: string[];
    isPrivate: boolean;
  }>({
    title: track.title || '',
    genre: track.genre || '',
    bpm: track.bpm || 120,
    description: track.description || '',
    mood: track.mood || '',
    tags: track.tags || [],
    isPrivate: track.isPrivate || false
  });
  
  // Gérer l'upload de l'image de couverture
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 5 Mo)
      if (file.size > MAX_IMAGE_SIZE) {
        setError('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      
      // Vérifier le format
      if (!ACCEPTED_IMAGE_FORMATS.includes(file.type)) {
        setError('Format d\'image non supporté. Utilisez JPG, PNG ou WEBP.');
        return;
      }
      
      setCoverImage(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Gérer les tags
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 3); // Limiter à 3 tags
    
    setValues(prev => ({ ...prev, tags: tagsArray }));
  };
  
  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validation des champs
    const validationRules = {
      title: (value: string) => !value ? 'Le titre est requis' : null,
      genre: (value: string) => !value ? 'Le genre est requis' : null,
      bpm: (value: number) => !value || value <= 0 ? 'Le BPM doit être positif' : null
    };
    
    if (!validate(validationRules)) {
      return;
    }
    
    try {
      // Convertir l'image de couverture en base64 si elle existe
      let coverImageBase64: string | null = null;
      let coverImageType: string | null = null;
      
      if (coverImage) {
        coverImageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(coverImage);
        });
        coverImageType = coverImage.type;
      }
      
      // Préparer les données du formulaire
      const trackData = {
        title: values.title,
        genre: values.genre,
        bpm: Number(values.bpm),
        description: values.description,
        mood: values.mood,
        tags: values.tags,
        isPrivate: values.isPrivate,
        coverImageBase64,
        coverImageType
      };
      
      // Mettre à jour la piste
      await updateTrackMutation.mutateAsync({
        trackId: track.track_id,
        data: trackData
      });
      
      // Afficher le succès
      setSuccess(true);
      
      // Appeler le callback de succès après un court délai
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      setError('Une erreur est survenue lors de la mise à jour. Veuillez réessayer.');
    }
  }, [track.track_id, coverImage, values, validate, updateTrackMutation, onSuccess]);
  
  return (
    <Card padding="1.5rem">
      <Heading level={3} marginBottom="1rem">
        Modifier la piste
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
          Votre piste a été mise à jour avec succès !
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1.5rem">
          {/* Section informations et image */}
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
                placeholder="Entrez le titre de votre piste"
                hasError={!!errors.title}
                errorMessage={errors.title}
                isRequired
              />
              
              <SelectField
                label="Genre"
                name="genre"
                value={values.genre}
                onChange={handleChange}
                placeholder="Sélectionnez un genre"
                hasError={!!errors.genre}
                errorMessage={errors.genre}
                isRequired
              >
                <option value="">Sélectionnez un genre</option>
                {MUSIC_GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </SelectField>
              
              <TextField
                label="BPM"
                name="bpm"
                type="number"
                value={values.bpm.toString()}
                onChange={handleChange}
                placeholder="Entrez le BPM"
                hasError={!!errors.bpm}
                errorMessage={errors.bpm}
                isRequired
              />
              
              <TextAreaField
                label="Description (optionnelle)"
                name="description"
                value={values.description}
                onChange={handleChange}
                placeholder="Décrivez votre piste"
                rows={3}
              />
              
              <SwitchField
                label="Piste privée"
                name="isPrivate"
                checked={values.isPrivate}
                onChange={(e) => setValues(prev => ({ ...prev, isPrivate: e.target.checked }))}
                labelPosition="end"
              />
            </Flex>
          </Flex>
          
          {/* Section tags et mood */}
          <Card padding="1.5rem">
            <Heading level={4} marginBottom="1rem">Informations supplémentaires</Heading>
            
            <TextField
              label="Tags (séparés par des virgules, max 3)"
              value={(values.tags || []).join(', ')}
              onChange={handleTagsChange}
              placeholder="Ex: Drill, Mélancolique, Trap"
            />
            
            <SelectField
              label="Mood musical"
              name="mood"
              value={values.mood}
              onChange={handleChange}
              marginTop="1rem"
            >
              <option value="">Sélectionnez un mood</option>
              {MUSIC_MOODS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </SelectField>
          </Card>
          
          {/* Boutons de soumission */}
          <Flex gap="1rem">
            <ChordoraButton 
              type="submit" 
              variation="primary"
              isLoading={updateTrackMutation.isPending}
              style={{ 
                borderRadius: '20px',
                backgroundColor: 'var(--chordora-primary)'
              }}
            >
              <FaSave style={{ marginRight: '0.5rem' }} />
              {updateTrackMutation.isPending ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
            </ChordoraButton>
            
            <ChordoraButton 
              onClick={onCancel}
              variation="link"
              style={{ 
                borderRadius: '20px'
              }}
            >
              Annuler
            </ChordoraButton>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default React.memo(TrackEditForm);