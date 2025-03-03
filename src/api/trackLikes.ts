import apiClient from './index';

/**
 * Interface pour la réponse de vérification de like
 */
export interface LikeStatusResponse {
  isLiked: boolean;
  trackId: string;
}

/**
 * Interface pour la réponse des IDs de pistes likées
 */
export interface TrackIdsResponse {
  trackIds: string[];
  totalLikes: number;
}

/**
 * Vérifie si l'utilisateur a liké une piste spécifique
 * @param trackId ID de la piste
 * @returns Promise avec le statut du like
 */
export const checkLikeStatus = (trackId: string) => 
  apiClient.get<LikeStatusResponse>(`/track-likes/${trackId}`);

/**
 * Récupère les IDs des pistes likées par l'utilisateur courant
 * @returns Promise avec les IDs des pistes likées
 */
export const getUserLikeIds = () => 
  apiClient.get<TrackIdsResponse>('/track-likes');

/**
 * Récupère les IDs des pistes likées par un utilisateur spécifique
 * @param userId ID de l'utilisateur
 * @returns Promise avec les IDs des pistes likées
 */
export const getUserLikeIdsById = (userId: string) => 
  apiClient.get<TrackIdsResponse>(`/track-likes?userId=${userId}`);

/**
 * Ajoute un like à une piste
 * @param trackId ID de la piste à liker
 * @returns Promise avec la réponse de l'API
 */
export const addLike = (trackId: string) => 
  apiClient.post('/track-likes', { trackId });

/**
 * Supprime un like d'une piste
 * @param trackId ID de la piste à unliker
 * @returns Promise avec la réponse de l'API
 */
export const removeLike = (trackId: string) => 
  apiClient.delete(`/track-likes/${trackId}`);