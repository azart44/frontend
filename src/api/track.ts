import apiClient from './index';

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