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
  TextAreaField
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaCloudUploadAlt, FaMusic } from 'react-icons/fa';
import axios from 'axios';
import { createTrack } from '../../api/track';
import { useForm } from '../../hooks/useForm';

interface TrackMetadata {
  title: string;
  genre: string;
  bpm: number;
  description?: string;
  tags?: string[];
}

const ACCEPTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 Mo

const TrackUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  // Utiliser le hook de formulaire pour gérer les valeurs
  const { values, handleChange, errors, validate, setValues } = useForm<TrackMetadata>({
    title: '',
    genre: '',
    bpm: 0,
    description: '',
    tags: []
  });
  
  // Mutation pour créer une piste
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File, metadata: TrackMetadata }) => {
      // 1. Récupérer l'URL signée
      const createResponse = await createTrack({
        fileName: data.file.name,
        fileType: data.file.type,
        ...data.metadata
      });
      
      const { uploadUrl, trackId } = createResponse.data;
      
      // 2. Uploader le fichier sur S3
      await axios.put(uploadUrl, data.file, {
        headers: { 'Content-Type': data.file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      return { trackId };
    },
    onSuccess: () => {
      navigate('/profile');
    }
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
  
  // Soumettre le formulaire
// Soumettre le formulaire
const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }
    
    // Valider uniquement les champs requis, pas tous les champs du formulaire
    const validationRules = {
      title: (value: string) => !value ? 'Le titre est requis' : null,
      genre: (value: string) => !value ? 'Le genre est requis' : null,
      bpm: (value: number) => !value ? 'Le BPM est requis' : null,
    };
    
    if (!validate(validationRules)) {
      return;
    }
    
    // Démarrer l'upload
    uploadMutation.mutate({
      file,
      metadata: values
    });
  }, [file, values, validate, uploadMutation]);
  
  return (
    <View padding="2rem">
      <Heading level={2} marginBottom="1rem">Ajouter une nouvelle piste</Heading>
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1rem">
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
            <option value="Drill">Drill</option>
            <option value="Trap">Trap</option>
            <option value="Boom Bap">Boom Bap</option>
            <option value="RnB">RnB</option>
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
            value={values.description || ''}
            onChange={handleChange}
            rows={3}
          />
          
          {/* Barre de progression */}
          {uploadProgress > 0 && (
            <Flex direction="column" marginTop="1rem">
              <Text>Upload Progress: {uploadProgress.toFixed(2)}%</Text>
              <View 
                backgroundColor="blue.600" 
                style={{ width: `${uploadProgress}%`, height: '4px', marginTop: '0.5rem' }}
              />
            </Flex>
          )}
          
          {/* Bouton d'envoi */}
          <Button 
            type="submit" 
            variation="primary" 
            isDisabled={uploadMutation.isPending || !file}
            isLoading={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Téléversement en cours...' : 'Téléverser la piste'}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default React.memo(TrackUpload);