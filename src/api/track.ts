import apiClient from './index';
import { Track, TrackFormData } from '../types/TrackTypes';

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
  
  // Construire la chaîne de requête
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get<Track[]>(`/tracks${queryString}`);
};

/**
 * Récupère une piste spécifique par son ID
 * @param trackId ID de la piste
 * @returns Promise avec les détails de la piste
 */
export const getTrackById = (trackId: string) => 
  apiClient.get<Track>(`/tracks/${trackId}`);

/**
 * Crée une nouvelle piste audio
 * @param trackData Données du formulaire et métadonnées
 * @param file Fichier audio
 * @returns Promise avec la réponse de création
 */
export const createTrack = (trackData: TrackFormData) => 
  apiClient.post<{trackId: string, uploadUrl: string}>('/tracks', trackData);

/**
 * Met à jour une piste existante
 * @param trackId ID de la piste
 * @param trackData Données à mettre à jour
 * @returns Promise avec la réponse de mise à jour
 */
export const updateTrack = (trackId: string, trackData: Partial<TrackFormData>) => 
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
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  return apiClient.get<Track[]>(`/search-tracks?${queryParams.toString()}`);
};