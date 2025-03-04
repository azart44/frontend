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
  SwitchField,
  Image,
  Divider
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaMusic, FaImage } from 'react-icons/fa';
import { useCreateTrack } from '../../hooks/useTracks';
import { useForm } from '../../hooks/useForm';
import { MUSIC_GENRES } from '../../constants/profileData';

// Formats de fichiers audio acceptés
const ACCEPTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
// Formats d'images acceptés
const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
// Taille maximale de fichier audio (25 Mo)
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
// Taille maximale d'image (5 Mo)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Composant pour uploader une nouvelle piste audio avec image de couverture
 */
const TrackUpload: React.FC = () => {
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFileDragActive, setAudioFileDragActive] = useState(false);
  const [coverImageDragActive, setCoverImageDragActive] = useState(false);
  
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
  const validateAudioFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_AUDIO_FORMATS.includes(file.type)) {
      return 'Format de fichier non supporté. Utilisez MP3 ou WAV.';
    }
    
    if (file.size > MAX_AUDIO_SIZE) {
      return `Le fichier est trop volumineux. La taille maximum est de ${MAX_AUDIO_SIZE / 1024 / 1024} Mo.`;
    }
    
    return null;
  }, []);
  
  // Validation de l'image de couverture
  const validateCoverImage = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_FORMATS.includes(file.type)) {
      return 'Format d\'image non supporté. Utilisez JPG, PNG ou WEBP.';
    }
    
    if (file.size > MAX_IMAGE_SIZE) {
      return `L'image est trop volumineuse. La taille maximum est de ${MAX_IMAGE_SIZE / 1024 / 1024} Mo.`;
    }
    
    return null;
  }, []);
  
  // Gérer le drag and drop pour le fichier audio
  const handleAudioDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setAudioFileDragActive(true);
    } else if (e.type === 'dragleave') {
      setAudioFileDragActive(false);
    }
  }, []);
  
  // Gérer le drag and drop pour l'image de couverture
  const handleCoverImageDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setCoverImageDragActive(true);
    } else if (e.type === 'dragleave') {
      setCoverImageDragActive(false);
    }
  }, []);
  
  // Gérer le drop de fichier audio
  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioFileDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateAudioFile(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      setAudioFile(file);
    }
  }, [validateAudioFile]);
  
  // Gérer le drop d'image de couverture
  const handleCoverImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverImageDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateCoverImage(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      handleCoverImageFile(file);
    }
  }, [validateCoverImage]);
  
  // Gérer la sélection de fichier audio
  const handleAudioFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateAudioFile(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      setAudioFile(file);
    }
  }, [validateAudioFile]);
  
  // Gérer la sélection d'image de couverture
  const handleCoverImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateCoverImage(file);
      
      if (error) {
        alert(error);
        return;
      }
      
      handleCoverImageFile(file);
    }
  }, [validateCoverImage]);
  
  // Traiter l'image de couverture sélectionnée
  const handleCoverImageFile = (file: File) => {
    setCoverImage(file);
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Supprimer l'image de couverture
  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };
  
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
    
    if (!audioFile) {
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
    
    // Convertir l'image en base64 si elle existe
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
    const formData = {
      title: values.title,
      genre: values.genre,
      bpm: Number(values.bpm),
      description: values.description,
      tags: values.tags,
      isPrivate: values.isPrivate,
      fileName: audioFile.name,
      fileType: audioFile.type,
      coverImageBase64, // Ajouter l'image en base64
      coverImageType    // Type de l'image
    };
    
    try {
      // Démarrer l'upload
      setUploadProgress(0);
      
      // Démarrer l'upload avec le hook personnalisé
      await uploadTrackMutation.mutateAsync({
        formData,
        file: audioFile
      });
      
      // Rediriger vers le profil après succès
      navigate('/profile');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Une erreur est survenue lors de l\'upload. Veuillez réessayer.');
    }
  }, [audioFile, coverImage, values, validate, navigate, uploadTrackMutation]);
  
  return (
    <View padding="2rem">
      <Heading level={2} marginBottom="1rem">Ajouter une nouvelle piste</Heading>
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1.5rem">
          {/* Section informations principales */}
          <Card padding="1.5rem">
            <Heading level={3} marginBottom="1rem">Informations de la piste</Heading>
            
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
              marginTop="1rem"
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
              marginTop="1rem"
            />
            
            <TextAreaField
              label="Description (optionnelle)"
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={3}
              marginTop="1rem"
            />
            
            <TextField
              label="Tags (séparés par des virgules)"
              value={values.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="Ex: chill, melodic, summer"
              marginTop="1rem"
            />
            
            <SwitchField
              label="Piste privée"
              name="isPrivate"
              checked={values.isPrivate}
              onChange={(e) => setValues(prev => ({ ...prev, isPrivate: e.target.checked }))}
              labelPosition="end"
              marginTop="1rem"
            />
          </Card>
          
          {/* Zone de drop pour le fichier audio */}
          <Card>
            <Heading level={3} marginBottom="1rem">Fichier Audio</Heading>
            
            <Card
              onDragEnter={handleAudioDrag}
              onDragOver={handleAudioDrag}
              onDragLeave={handleAudioDrag}
              onDrop={handleAudioDrop}
              padding="2rem"
              backgroundColor={audioFileDragActive ? "rgba(62, 29, 252, 0.05)" : "white"}
              style={{
                border: audioFileDragActive ? "2px dashed #3e1dfc" : "2px dashed #ccc",
                textAlign: "center",
                cursor: "pointer"
              }}
              onClick={() => document.getElementById('audio-upload')?.click()}
            >
              <Flex direction="column" alignItems="center" gap="1rem">
                {audioFile ? (
                  <>
                    <FaMusic size={48} color="#3e1dfc" />
                    <Text fontWeight="bold">{audioFile.name}</Text>
                    <Text>{(audioFile.size / (1024 * 1024)).toFixed(2)} Mo</Text>
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt size={48} />
                    <Text fontWeight="bold">
                      Glissez votre fichier audio ici ou cliquez pour parcourir
                    </Text>
                    <Text fontSize="small" color="gray">
                      MP3 ou WAV, max 25 Mo
                    </Text>
                  </>
                )}
              </Flex>
              <input
                id="audio-upload"
                type="file"
                accept=".mp3,.wav"
                onChange={handleAudioFileChange}
                style={{ display: "none" }}
              />
            </Card>
          </Card>
          
          {/* Zone de drop pour l'image de couverture */}
          <Card>
            <Heading level={3} marginBottom="1rem">Image de couverture (optionnelle)</Heading>
            
            {coverImagePreview ? (
              <Flex direction="column" alignItems="center" gap="1rem">
                <Image
                  src={coverImagePreview}
                  alt="Aperçu de la couverture"
                  width="200px"
                  height="200px"
                  objectFit="cover"
                  borderRadius="8px"
                />
                <Text>{coverImage?.name} - {(coverImage?.size || 0 / (1024 * 1024)).toFixed(2)} Mo</Text>
                <Button 
                  onClick={handleRemoveCoverImage} 
                  variation="destructive"
                  size="small"
                >
                  Supprimer l'image
                </Button>
              </Flex>
            ) : (
              <Card
                onDragEnter={handleCoverImageDrag}
                onDragOver={handleCoverImageDrag}
                onDragLeave={handleCoverImageDrag}
                onDrop={handleCoverImageDrop}
                padding="2rem"
                backgroundColor={coverImageDragActive ? "rgba(135, 229, 76, 0.05)" : "white"}
                style={{
                  border: coverImageDragActive ? "2px dashed #87e54c" : "2px dashed #ccc",
                  textAlign: "center",
                  cursor: "pointer"
                }}
                onClick={() => document.getElementById('cover-image-upload')?.click()}
              >
                <Flex direction="column" alignItems="center" gap="1rem">
                  <FaImage size={48} />
                  <Text fontWeight="bold">
                    Glissez une image de couverture ici ou cliquez pour parcourir
                  </Text>
                  <Text fontSize="small" color="gray">
                    JPG, PNG ou WEBP, max 5 Mo
                  </Text>
                </Flex>
                <input
                  id="cover-image-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleCoverImageChange}
                  style={{ display: "none" }}
                />
              </Card>
            )}
          </Card>
          
          {/* Barre de progression */}
          {uploadProgress > 0 && (
            <Flex direction="column" marginTop="1rem">
              <Text>Progression de l'upload: {uploadProgress}%</Text>
              <View 
                backgroundColor="#3e1dfc" 
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
            isDisabled={uploadTrackMutation.isPending || !audioFile}
            isLoading={uploadTrackMutation.isPending}
            size="large"
          >
            {uploadTrackMutation.isPending ? 'Téléversement en cours...' : 'Téléverser la piste'}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default React.memo(TrackUpload);