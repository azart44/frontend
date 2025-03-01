import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  View, 
  Heading, 
  TextField, 
  SelectField, 
  Button, 
  Flex, 
  Text
} from '@aws-amplify/ui-react';
import api from '../utils/api';
import axios from 'axios';

interface TrackMetadata {
  title: string;
  genre: string;
  bpm: number;
}

const AddTrack: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    if (!file) {
      alert('Please select an audio file');
      setIsUploading(false);
      return;
    }

    try {
      // Get pre-signed URL and track ID from Lambda
      const response = await api.post('/tracks', {
        fileName: file.name,
        fileType: file.type,
        title,
        genre,
        bpm: parseInt(bpm)
      });

      const { uploadUrl, trackId } = response.data;

      // Upload file directly to S3 with minimal headers
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      alert('Track uploaded successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error uploading track:', error);
      alert('Error uploading track. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View padding="2rem">
      <Heading level={2}>Add New Track</Heading>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1rem">
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <SelectField
            label="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          >
            <option value="">Select a genre</option>
            <option value="Drill">Drill</option>
            <option value="Trap">Trap</option>
            <option value="Boom Bap">Boom Bap</option>
          </SelectField>
          <TextField
            label="BPM"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            required
          />
          <input
            type="file"
            accept=".mp3"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (files) setFile(files[0]);
            }}
            required
          />
          <Button type="submit" variation="primary" isDisabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Track'}
          </Button>
        </Flex>
      </form>
      {uploadProgress > 0 && (
        <Flex direction="column" marginTop="1rem">
          <Text>Upload Progress: {uploadProgress.toFixed(2)}%</Text>
          <View 
            backgroundColor="blue.600" 
            width={`${uploadProgress}%`} 
            height="4px" 
            marginTop="0.5rem"
          />
        </Flex>
      )}
    </View>
  );
};

export default AddTrack;

// Utility function to update track metadata
export const updateTrackMetadata = async (trackId: string, metadata: Partial<TrackMetadata>) => {
  try {
    await api.put(`/tracks/${trackId}`, metadata);
    alert('Track metadata updated successfully');
  } catch (error) {
    console.error('Error updating track metadata:', error);
    alert('Error updating track metadata. Please try again.');
  }
};