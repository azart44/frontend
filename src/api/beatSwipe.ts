import apiClient from './index';
import { Track } from '../types/TrackTypes';

/**
 * Interface pour la réponse de recommandations de BeatSwipe
 */
export interface BeatSwipeRecommendationsResponse {
  tracks: Track[];
  count: number;
}

/**
 * Interface pour l'enregistrement d'une action de swipe
 */
export interface BeatSwipeAction {
  trackId: string;
  action: 'right' | 'left' | 'down'; // right = like, left = skip, down = save for later
}

/**
 * Interface pour un match BeatSwipe
 */
export interface BeatSwipeMatch {
  match_id: string;
  timestamp: number;
  status: 'new' | 'viewed' | 'contacted' | 'completed';
  track: {
    track_id: string;
    title: string;
    genre: string;
    bpm?: number;
    cover_image?: string;
    presigned_url?: string;
  };
  artist: {
    user_id: string;
    username: string;
    profile_image_url?: string;
  };
  beatmaker: {
    user_id: string;
    username: string;
    profile_image_url?: string;
  };
}

/**
 * Interface pour la réponse de matches BeatSwipe
 */
export interface BeatSwipeMatchesResponse {
  matches: BeatSwipeMatch[];
  count: number;
}

/**
 * Récupère les recommandations de beats pour BeatSwipe
 * @returns Promise avec les pistes recommandées
 */
export const getSwipeRecommendations = () => 
  apiClient.get<BeatSwipeRecommendationsResponse>('/beatswipe/recommendations');

/**
 * Enregistre une action de swipe (like, skip, favorite)
 * @param action Objet contenant l'ID de la piste et l'action effectuée
 * @returns Promise avec la réponse du serveur
 */
export const recordSwipeAction = (action: BeatSwipeAction) => 
  apiClient.post('/beatswipe/action', action);

/**
 * Récupère les matches BeatSwipe de l'utilisateur
 * @returns Promise avec les matches
 */
export const getSwipeMatches = () => 
  apiClient.get<BeatSwipeMatchesResponse>('/beatswipe/matches');