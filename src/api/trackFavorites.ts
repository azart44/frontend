import apiClient from './index';

/**
 * Interface pour la réponse de vérification de favori
 */
export interface FavoriteStatusResponse {
  isFavorite: boolean;
  trackId: string;
}

/**
 * Interface pour la réponse des IDs de pistes favorites
 */
export interface TrackIdsResponse {
  trackIds: string[];
  totalFavorites: number;
}

/**
 * Vérifie si l'utilisateur a ajouté une piste spécifique à ses favoris
 * @param trackId ID de la piste
 * @returns Promise avec le statut du favori
 */
export const checkFavoriteStatus = (trackId: string) => 
  apiClient.get<FavoriteStatusResponse>(`/track-favorites/${trackId}`);

/**
 * Récupère les IDs des pistes favorites de l'utilisateur courant
 * @returns Promise avec les IDs des pistes favorites
 */
export const getUserFavoriteIds = () => 
  apiClient.get<TrackIdsResponse>('/track-favorites');

/**
 * Ajoute une piste aux favoris
 * @param trackId ID de la piste à ajouter aux favoris
 * @returns Promise avec la réponse de l'API
 */
export const addFavorite = (trackId: string) => 
  apiClient.post('/track-favorites', { trackId });

/**
 * Supprime une piste des favoris
 * @param trackId ID de la piste à retirer des favoris
 * @returns Promise avec la réponse de l'API
 */
export const removeFavorite = (trackId: string) => 
  apiClient.delete(`/track-favorites/${trackId}`);