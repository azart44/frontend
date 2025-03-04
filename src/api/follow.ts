import apiClient from './index';

export interface FollowStatusResponse {
  isFollowing: boolean;
  isFollowedBy: boolean;
  follower_id: string;
  followed_id: string;
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
 * Suivre un utilisateur
 * @param followedId ID de l'utilisateur à suivre
 */
export const followUser = (followedId: string) => 
  apiClient.post('/follow', { followedId });

/**
 * Arrêter de suivre un utilisateur
 * @param followedId ID de l'utilisateur à ne plus suivre
 */
export const unfollowUser = (followedId: string) => 
  apiClient.delete('/follow', { data: { followedId } });

/**
 * Vérifier le statut de suivi entre l'utilisateur connecté et un autre utilisateur
 * @param targetId ID de l'utilisateur cible
 */
export const getFollowStatus = (targetId: string) => 
  apiClient.get<FollowStatusResponse>(`/follow/status/${targetId}`);

/**
 * Obtenir les compteurs de followers et de suivis d'un utilisateur
 * @param userId ID de l'utilisateur (facultatif, utilise l'utilisateur authentifié par défaut)
 */
export const getFollowCounts = (userId?: string) => {
  const url = userId ? `/follow/${userId}` : '/follow';
  return apiClient.get<FollowCountsResponse>(url);
};

/**
 * Obtenir la liste des followers d'un utilisateur
 * @param userId ID de l'utilisateur (facultatif, utilise l'utilisateur authentifié par défaut)
 */
export const getFollowers = (userId?: string) => {
  const url = userId ? `/follow/followers/${userId}` : '/follow/followers';
  return apiClient.get<FollowersResponse>(url);
};

/**
 * Obtenir la liste des utilisateurs suivis par un utilisateur
 * @param userId ID de l'utilisateur (facultatif, utilise l'utilisateur authentifié par défaut)
 */
export const getFollowing = (userId?: string) => {
  const url = userId ? `/follow/following/${userId}` : '/follow/following';
  return apiClient.get<FollowingResponse>(url);
};