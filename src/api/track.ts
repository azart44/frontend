import apiClient from './index';
import { Track } from '../types/TrackTypes';

/**
 * Interface pour la réponse de la liste des pistes
 */
export interface TracksResponse {
  tracks: Track[];
  count: number;
}

/**
 * Récupère les pistes audio, filtrées par utilisateur si spécifié
 * @param userId ID utilisateur optionnel
 * @param filters Filtres additionnels (genre, etc.)
 * @returns Promise avec la liste des pistes
 */
export const getTracks = (userId?: string, filters?: Record<string, string>) => {
  const params: Record<string, string> = { ...filters };
  if (userId) {
    params.userId = userId;
  }
  
  return apiClient.get<TracksResponse>('/tracks', { params });
};

/**
 * Récupère les pistes likées par l'utilisateur courant
 * @returns Promise avec la liste des pistes likées
 */
export const getLikedTracks = () => {
  return apiClient.get<TracksResponse>('/tracks', { 
    params: { likedBy: 'current' }
  });
};

/**
 * Récupère les pistes likées par un utilisateur spécifique
 * @param userId ID de l'utilisateur
 * @returns Promise avec la liste des pistes likées
 */
export const getLikedTracksByUserId = (userId: string) => {
  return apiClient.get<TracksResponse>('/tracks', { 
    params: { likedBy: userId }
  });
};

/**
 * Récupère une piste spécifique par son ID
 * @param trackId ID de la piste
 * @returns Promise avec les détails de la piste
 */
export const getTrackById = (trackId: string) => 
  apiClient.get<Track>(`/tracks/${trackId}`);

/**
 * Récupère plusieurs pistes par leurs IDs
 * @param trackIds Liste des IDs de pistes
 * @returns Promise avec la liste des pistes
 */
export const getTracksByIds = (trackIds: string[]) => {
  const idsString = trackIds.join(',');
  return apiClient.get<TracksResponse>('/tracks', { 
    params: { ids: idsString }
  });
};

/**
 * Crée une nouvelle piste audio
 * @param trackData Données du formulaire et métadonnées
 * @param file Fichier audio
 * @returns Promise avec la réponse de création
 */
export const createTrack = (trackData: any) => 
  apiClient.post<{trackId: string, uploadUrl: string}>('/tracks', trackData);

/**
 * Met à jour une piste existante
 * @param trackId ID de la piste
 * @param trackData Données à mettre à jour
 * @returns Promise avec la réponse de mise à jour
 */
export const updateTrack = (trackId: string, trackData: Partial<any>) => 
  apiClient.put<{message: string}>(`/tracks/${trackId}`, trackData);

/**
 * Supprime une piste
 * @param trackId ID de la piste à supprimer
 * @returns Promise avec la réponse de suppression
 */
export const deleteTrack = (trackId: string) => 
  apiClient.delete<{message: string}>(`/tracks/${trackId}`);

/**
 * Recherche des pistes par divers critères
 * @param params Paramètres de recherche
 * @returns Promise avec les résultats de recherche
 */
export const searchTracks = (params: Record<string, string | number>) => {
  return apiClient.get<TracksResponse>('/search-tracks', { params });
};

/**
 * Incrémente le compteur d'écoutes d'une piste
 * @param trackId ID de la piste écoutée
 * @returns Promise avec la réponse de l'API
 */
export const incrementPlayCount = (trackId: string) => 
  apiClient.post('/track-plays', { trackId });