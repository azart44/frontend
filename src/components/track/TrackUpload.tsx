import React, { useState, useCallback } from 'react';
import { 
  View, 
  Heading, 
  TextField, 
  SelectField, 
  Button, 
  Flex, 
  Text,
  Card,
  TextAreaField,
  SwitchField
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaMusic } from 'react-icons/fa';
import { useCreateTrack } from '../../hooks/useTracks';
import { useForm } from '../../hooks/useForm';
import { MUSIC_GENRES } from '../../constants/profileData';

// Formats de fichiers audio acceptés
const ACCEPTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
// Taille maximale de fichier (25 Mo)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Composant pour uploader une nouvelle piste audio
 */
const TrackUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  // Utiliser le hook personnalisé pour la création de piste
  const uploadTrackMutation = useCreateTrack();
  
  // Utiliser le hook de formulaire pour gérer les valeurs
  const { values, handleChange, errors, validate, setValues } = useForm({
    title: '',
    genre: '',
    bpm: 0,
    description: '',
    tags: [] as string[],
    isPrivate: false
  });
  
  // Validation du fichier audio
  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_AUDIO_FORMATS.includes(file.type)) {
      return 'Format de fichier non supporté. Utilisez MP3 ou WAV.';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `Le fichier est trop volumineux. La taille maximum est de ${MAX_FILE_SIZE / 1024 / 1024} Mo.`;
    }
    
    return null;
  }, []);
  
  // Gérer le drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Gérer le drop de fichier
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateFile(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      setFile(file);
    }
  }, [validateFile]);
  
  // Gérer la sélection de fichier
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      setFile(file);
    }
  }, [validateFile]);
  
  // Gérer les tags (séparés par des virgules)
  const handleTagsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setValues(prev => ({ ...prev, tags: tagsArray }));
  }, [setValues]);
  
  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }
    
    // Valider uniquement les champs requis
    const validationRules = {
      title: (value: string) => !value ? 'Le titre est requis' : null,
      genre: (value: string) => !value ? 'Le genre est requis' : null,
      bpm: (value: number) => !value ? 'Le BPM est requis' : null,
    };
    
    if (!validate(validationRules)) {
      return;
    }
    
    // Préparer les données du formulaire
    const formData = {
      title: values.title,
      genre: values.genre,
      bpm: Number(values.bpm),
      description: values.description,
      tags: values.tags,
      isPrivate: values.isPrivate,
      fileName: file.name,
      fileType: file.type,
    };
    
    try {
      // Démarrer l'upload
      setUploadProgress(0);
      
      // Suivre la progression de l'upload
      const progressCallback = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };
      
      // Démarrer l'upload avec le hook personnalisé
      await uploadTrackMutation.mutateAsync({
        formData,
        file
      });
      
      // Rediriger vers le profil après succès
      navigate('/profile');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Une erreur est survenue lors de l\'upload. Veuillez réessayer.');
    }
  }, [file, values, validate, navigate, uploadTrackMutation]);
  
  return (
    <View padding="2rem">
      <Heading level={2} marginBottom="1rem">Ajouter une nouvelle piste</Heading>
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1.5rem">
          {/* Zone de drop pour le fichier */}
          <Card
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            padding="2rem"
            backgroundColor={dragActive ? "rgba(0, 0, 255, 0.05)" : "white"}
            style={{
              border: dragActive ? "2px dashed blue" : "2px dashed #ccc",
              textAlign: "center",
              cursor: "pointer"
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Flex direction="column" alignItems="center" gap="1rem">
              {file ? (
                <>
                  <FaMusic size={48} color="green" />
                  <Text fontWeight="bold">{file.name}</Text>
                  <Text>{(file.size / (1024 * 1024)).toFixed(2)} Mo</Text>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt size={48} />
                  <Text fontWeight="bold">
                    Glissez votre fichier ici ou cliquez pour parcourir
                  </Text>
                  <Text fontSize="small" color="gray">
                    MP3 ou WAV, max 25 Mo
                  </Text>
                </>
              )}
            </Flex>
            <input
              id="file-upload"
              type="file"
              accept=".mp3,.wav"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </Card>
          
          {/* Métadonnées de la piste */}
          <TextField
            label="Titre"
            name="title"
            value={values.title}
            onChange={handleChange}
            hasError={!!errors.title}
            errorMessage={errors.title}
            required
          />
          
          <SelectField
            label="Genre"
            name="genre"
            value={values.genre}
            onChange={handleChange}
            hasError={!!errors.genre}
            errorMessage={errors.genre}
            required
          >
            <option value="">Sélectionner un genre</option>
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
            hasError={!!errors.bpm}
            errorMessage={errors.bpm}
            required
          />
          
          <TextAreaField
            label="Description (optionnelle)"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={3}
          />
          
          <TextField
            label="Tags (séparés par des virgules)"
            value={values.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="Ex: chill, melodic, summer"
          />
          
          <SwitchField
            label="Piste privée"
            name="isPrivate"
            checked={values.isPrivate}
            onChange={(e) => setValues(prev => ({ ...prev, isPrivate: e.target.checked }))}
            labelPosition="end"
          />
          
          {/* Barre de progression */}
          {uploadProgress > 0 && (
            <Flex direction="column" marginTop="1rem">
              <Text>Progression de l'upload: {uploadProgress}%</Text>
              <View 
                backgroundColor="blue.600" 
                style={{ 
                  width: `${uploadProgress}%`, 
                  height: '4px', 
                  marginTop: '0.5rem',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </Flex>
          )}
          
          {/* Bouton d'envoi */}
          <Button 
            type="submit" 
            variation="primary" 
            isDisabled={uploadTrackMutation.isPending || !file}
            isLoading={uploadTrackMutation.isPending}
          >
            {uploadTrackMutation.isPending ? 'Téléversement en cours...' : 'Téléverser la piste'}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default React.memo(TrackUpload);