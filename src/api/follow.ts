import apiClient from './index';

// Types pour les réponses de l'API
export interface FollowStatusResponse {
  isFollowing: boolean;
  isFollowedBy: boolean;
  follower_id: string;
  followed_id: string;
  followDate?: number;
}

export interface FollowCountsResponse {
  userId: string;
  followersCount: number;
  followingCount: number;
}

export interface UserProfile {
  userId: string;
  username?: string;
  userType?: string;
  profileImageUrl?: string;
  followDate?: number;
  isFollowing?: boolean;
}

export interface FollowersResponse {
  followers: UserProfile[];
  count: number;
}

export interface FollowingResponse {
  following: UserProfile[];
  count: number;
}

/**
 * Suit un utilisateur
 * @param followed_id ID de l'utilisateur à suivre
 */
export const followUser = (followed_id: string) => 
  apiClient.post('/follows', { followed_id });

/**
 * Arrête de suivre un utilisateur
 * @param followed_id ID de l'utilisateur à ne plus suivre
 */
export const unfollowUser = (followed_id: string) => 
  apiClient.delete('/follows', { data: { followed_id } });

/**
 * Vérifie le statut de suivi entre l'utilisateur connecté et un autre utilisateur
 * @param targetId ID de l'utilisateur cible
 */
export const getFollowStatus = (targetId: string) => 
  apiClient.get<FollowStatusResponse>(`/follows/status?targetId=${targetId}`);

/**
 * Obtient les compteurs de followers et de suivis d'un utilisateur
 * @param userId ID de l'utilisateur (facultatif, utilise l'utilisateur authentifié par défaut)
 */
export const getFollowCounts = (userId?: string) => {
  const queryParam = userId ? `?userId=${userId}` : '';
  return apiClient.get<FollowCountsResponse>(`/follows${queryParam}`);
};

/**
 * Obtient la liste des utilisateurs suivis par un utilisateur
 * @param userId ID de l'utilisateur (facultatif, utilise l'utilisateur authentifié par défaut)
 */
export const getFollowing = (userId?: string) => {
  const queryParam = userId ? `?userId=${userId}` : '';
  return apiClient.get<FollowingResponse>(`/follows/following${queryParam}`);
};

/**
 * Obtient la liste des followers d'un utilisateur
 * @param userId ID de l'utilisateur (facultatif, utilise l'utilisateur authentifié par défaut)
 */
export const getFollowers = (userId?: string) => {
  const queryParam = userId ? `?userId=${userId}` : '';
  return apiClient.get<FollowersResponse>(`/follows/followers${queryParam}`);
};