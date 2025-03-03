import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heading, 
  TextField, 
  SelectField, 
  Button, 
  Flex, 
  Text,
  Card,
  TextAreaField,
  Checkbox
} from '@aws-amplify/ui-react';
import { useMutation } from '@tanstack/react-query';
import { FaCloudUploadAlt, FaMusic } from 'react-icons/fa';
import { uploadData } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';

import { createTrack } from '../../api/track';
import { useForm } from '../../hooks/useForm';
import { TrackFormData } from '../../types/TrackTypes';

const ACCEPTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const sanitizeFileName = (fileName: string) => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]/gi, '_')
    .toLowerCase();
};

const TrackUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const { values, handleChange, errors, validate, setValues } = useForm<TrackFormData>({
    title: '',
    genre: '',
    bpm: 0,
    description: '',
    tags: [],
    mood: '',
    isPublic: false
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File, metadata: TrackFormData }) => {
      const trackId = uuidv4();
      const sanitizedFileName = sanitizeFileName(data.file.name);
      const s3Key = `tracks/${trackId}/${sanitizedFileName}`;

      try {
        const uploadResult = await uploadData({
          key: s3Key,
          data: data.file,
          options: {
            contentType: data.file.type,
            accessLevel: 'private',
            onProgress: (event) => {
              const { totalBytes, transferredBytes } = event as { totalBytes?: number; transferredBytes: number };
              const percentCompleted = totalBytes
                ? Math.round((transferredBytes * 100) / totalBytes)
                : 0;
              setUploadProgress(percentCompleted);
            }
          }
        }).result;

        const trackMetadata = {
          ...data.metadata,
          track_id: trackId,
          file_path: s3Key,
          fileType: data.file.type
        };

        const createResponse = await createTrack(trackMetadata);

        return { trackId, uploadResult, createResponse };
      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        throw error;
      }
    },
    onSuccess: () => {
      navigate('/profile');
    },
    onError: (error) => {
      console.error("Erreur lors du téléversement:", error);
      alert("Impossible de téléverser la piste. Veuillez réessayer.");
    }
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_AUDIO_FORMATS.includes(file.type)) {
      return 'Format de fichier non supporté. Utilisez MP3 ou WAV.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Le fichier est trop volumineux. La taille maximum est de ${MAX_FILE_SIZE / 1024 / 1024} Mo.`;
    }
    return null;
  }, []);

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Veuillez sélectionner un fichier audio');
      return;
    }

    const validationRules = {
      title: (value: string) => !value ? 'Le titre est requis' : null,
      genre: (value: string) => !value ? 'Le genre est requis' : null,
      bpm: (value: number) => !value ? 'Le BPM est requis' : null,
    };

    if (!validate(validationRules)) {
      return;
    }

    uploadMutation.mutate({
      file,
      metadata: values
    });
  }, [file, values, validate, uploadMutation]);

  return (
    <div style={{ padding: '2rem' }}>
      <Heading level={2} marginBottom="1rem">Ajouter une nouvelle piste</Heading>

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1rem">
          <Card
            onDragEnter={() => setDragActive(true)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            padding="2rem"
            backgroundColor={dragActive ? "rgba(0, 0, 255, 0.05)" : "white"}
            style={{ border: dragActive ? "2px dashed blue" : "2px dashed #ccc", textAlign: "center", cursor: "pointer" }}
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
                  <Text fontWeight="bold">Glissez votre fichier ici ou cliquez pour parcourir</Text>
                  <Text fontSize="small" color="gray">MP3 ou WAV, max 25 Mo</Text>
                </>
              )}
            </Flex>
            <input id="file-upload" type="file" accept=".mp3,.wav" onChange={handleFileChange} style={{ display: "none" }} />
          </Card>

          <TextField label="Titre" name="title" value={values.title} onChange={handleChange} hasError={!!errors.title} errorMessage={errors.title} required />
          <SelectField label="Genre" name="genre" value={values.genre} onChange={handleChange} required>
            <option value="">Sélectionner un genre</option>
            <option value="Drill">Drill</option>
            <option value="Trap">Trap</option>
          </SelectField>
          <TextField label="BPM" name="bpm" type="number" value={values.bpm?.toString()} onChange={handleChange} required />

          {uploadProgress > 0 && <Text>Progression: {uploadProgress}%</Text>}

          <Button type="submit" variation="primary" isDisabled={uploadMutation.isPending || !file} isLoading={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Téléversement en cours...' : 'Téléverser la piste'}
          </Button>
        </Flex>
      </form>
    </div>
  );
};

export default React.memo(TrackUpload);
