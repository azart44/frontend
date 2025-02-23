import React, { useState } from 'react';
import { Button, Flex, Text } from '@aws-amplify/ui-react';
import { uploadData, getUrl } from '@aws-amplify/storage';

interface AudioUploaderProps {
  userId: string;
  onUploadSuccess: (fileUrl: string) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ userId, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploading(true);
        setError(null);
        const fileName = `users/${userId}/audio/${Date.now()}-${file.name}`;
        
        await uploadData({
          key: fileName,
          data: file,
          options: {
            contentType: file.type,
          },
        }).result;

        setUploadProgress(100);

        const signedUrl = await getUrl({ key: fileName });
        if (signedUrl.url) {
          onUploadSuccess(signedUrl.url.toString());
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload audio. Please try again.');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <Flex direction="column" alignItems="center" margin="1rem 0">
      <input
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        style={{ display: 'none' }}
        id="audio-upload"
      />
      <label htmlFor="audio-upload">
        <Button as="span" isLoading={isUploading}>
          Upload Audio
        </Button>
      </label>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Text>Upload Progress: {uploadProgress.toFixed(2)}%</Text>
      )}
      {error && <Text color="red">{error}</Text>}
    </Flex>
  );
};

export default AudioUploader;