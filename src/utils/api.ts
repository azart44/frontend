import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const api = axios.create({
  baseURL: 'https://z8qzoeztpc.execute-api.us-east-1.amazonaws.com/prod',
});

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers['Authorization'] = token;
    }
  } catch (error) {
    console.error('Error fetching auth session:', error);
  }
  return config;
}, (error) => Promise.reject(error));

// Fonctions pour le service de profil utilisateur
export const getUserProfile = () => api.get('/user-profile');
export const getUserProfileById = (userId: string) => api.get(`/user-profile/${userId}`);
export const updateUserProfile = (profileData: any) => api.post('/user-profile', { profileData });
export const searchProfiles = (searchTerm: string) => api.get(`/search-profiles?term=${encodeURIComponent(searchTerm)}`);
export const getAllUsers = () => api.get('/get-all-users');

// Fonctions pour le service de pistes audio
export const getTracks = (userId?: string) => {
  const params = userId ? { userId } : {};
  return api.get('/tracks', { params });
};
export const getTrackById = (trackId: string) => api.get(`/tracks/${trackId}`);
export const createTrack = (trackData: any) => api.post('/tracks', trackData);
export const updateTrack = (trackId: string, trackData: any) => api.put(`/tracks/${trackId}`, trackData);
export const deleteTrack = (trackId: string) => api.delete(`/tracks/${trackId}`);
export const searchTracks = (params: any) => api.get('/search-tracks', { params });

export default api;