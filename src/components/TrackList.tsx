import React, { useState, useEffect, useRef } from 'react';
import { Card, Text, Heading, Flex, Badge, Button, TextField, SelectField } from '@aws-amplify/ui-react';
import { getTracks, getTrackById, updateTrack, deleteTrack } from '../utils/api';

interface Track {
  track_id: string;
  title: string;
  genre: string;
  bpm: number;
  file_path: string;
  user_id: string;
}

interface TrackListProps {
  userId: string;
}

const TrackList: React.FC<TrackListProps> = ({ userId }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchTracks();
  }, [userId]);

  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      const response = await getTracks(userId);
      setTracks(response.data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError('Failed to fetch tracks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (trackId: string) => {
    try {
      const response = await getTrackById(trackId);
      const { presigned_url } = response.data;
      
      if (audioRef.current) {
        audioRef.current.src = presigned_url;
        audioRef.current.play();
        setCurrentlyPlaying(trackId);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentlyPlaying(null);
    }
  };

  const handleUpdateTrack = async (trackId: string, updateData: Partial<Track>) => {
    try {
      await updateTrack(trackId, updateData);
      setEditingTrack(null);
      fetchTracks(); // Refresh the track list
    } catch (error) {
      console.error('Failed to update track:', error);
      setError('Failed to update track. Please try again.');
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrack(trackId);
      fetchTracks(); // Refresh the track list
    } catch (error) {
      console.error('Failed to delete track:', error);
      setError('Failed to delete track. Please try again.');
    }
  };

  if (isLoading) return <Text>Loading tracks...</Text>;
  if (error) return <Text>{error}</Text>;
  if (tracks.length === 0) return <Text>No tracks found.</Text>;

  return (
    <Flex direction="column" gap="1rem">
      {tracks.map((track) => (
        <Card key={track.track_id}>
          {editingTrack?.track_id === track.track_id ? (
            <Flex direction="column" gap="1rem">
              <TextField
                label="Title"
                value={editingTrack.title}
                onChange={(e) => setEditingTrack({...editingTrack, title: e.target.value})}
              />
              <SelectField
                label="Genre"
                value={editingTrack.genre}
                onChange={(e) => setEditingTrack({...editingTrack, genre: e.target.value})}
              >
                <option value="Drill">Drill</option>
                <option value="Trap">Trap</option>
                <option value="Boom Bap">Boom Bap</option>
              </SelectField>
              <TextField
                label="BPM"
                type="number"
                value={editingTrack.bpm}
                onChange={(e) => setEditingTrack({...editingTrack, bpm: parseInt(e.target.value)})}
              />
              <Button onClick={() => handleUpdateTrack(track.track_id, editingTrack)}>Save</Button>
              <Button onClick={() => setEditingTrack(null)}>Cancel</Button>
            </Flex>
          ) : (
            <>
              <Heading level={3}>{track.title}</Heading>
              <Flex gap="0.5rem" marginTop="0.5rem">
                <Badge variation="info">{track.genre}</Badge>
                <Badge variation="warning">{track.bpm} BPM</Badge>
              </Flex>
              <Button 
                onClick={() => currentlyPlaying === track.track_id ? stopAudio() : playAudio(track.track_id)}
                marginTop="0.5rem"
              >
                {currentlyPlaying === track.track_id ? 'Stop' : 'Play'}
              </Button>
              <Button onClick={() => setEditingTrack(track)} marginTop="0.5rem">
                Edit
              </Button>
              <Button onClick={() => handleDeleteTrack(track.track_id)} marginTop="0.5rem">
                Delete
              </Button>
            </>
          )}
        </Card>
      ))}
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
    </Flex>
  );
};

export default TrackList;