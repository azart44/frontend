import apiClient from './index';
import { getUrl } from 'aws-amplify/storage';

export const getTracks = (userId?: string) => {
  const params = userId ? { userId } : {};
  return apiClient.get('/tracks', { params });
};

export const getTrackById = (trackId: string) => 
  apiClient.get(`/tracks/${trackId}`);

export const createTrack = (trackData: any) => 
  apiClient.post('/tracks', trackData);

export const updateTrack = (trackId: string, trackData: any) => 
  apiClient.put(`/tracks/${trackId}`, trackData);

export const deleteTrack = (trackId: string) => 
  apiClient.delete(`/tracks/${trackId}`);

export const searchTracks = (params: any) => 
  apiClient.get('/search-tracks', { params });

export async function getTrackAudioUrl(filePath: string): Promise<string> {
  try {
    console.log('Tentative de récupération de l\'URL pour:', filePath);
    const result = await getUrl({
      key: filePath,
      options: {
        validateObjectExistence: true
      }
    });
    return result.url.toString();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL audio:', error);
    throw error;
  }
}