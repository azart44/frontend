import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as FollowAPI from '../api/follow';

// Clés de cache pour React Query
export const followKeys = {
  all: ['follows'] as const,
  status: (targetId: string) => [...followKeys.all, 'status', targetId] as const,
  counts: (userId?: string) => [...followKeys.all, 'counts', userId || 'me'] as const,
  followers: (userId?: string) => [...followKeys.all, 'followers', userId || 'me'] as const,
  following: (userId?: string) => [...followKeys.all, 'following', userId || 'me'] as const
};

/**
 * Hook pour vérifier le statut de suivi entre l'utilisateur connecté et un autre utilisateur
 */
export const useFollowStatus = (targetId: string | null) => {
    return useQuery({
      queryKey: followKeys.status(targetId || ''),
      queryFn: async () => {
        const response = await FollowAPI.getFollowStatus(targetId!);
        return response.data;
      },
      enabled: !!targetId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  };
  
  export const useFollowCounts = (userId?: string | null) => {
    return useQuery({
      queryKey: followKeys.counts(userId || undefined),
      queryFn: async () => {
        const response = await FollowAPI.getFollowCounts(userId!);
        return response.data;
      },
      enabled: !!userId,
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  };

/**
 * Hook pour obtenir la liste des followers d'un utilisateur
 */
export const useFollowers = (userId?: string) => {
  return useQuery({
    queryKey: followKeys.followers(userId),
    queryFn: async () => {
      const response = await FollowAPI.getFollowers(userId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook pour obtenir la liste des utilisateurs suivis par un utilisateur
 */
export const useFollowing = (userId?: string) => {
  return useQuery({
    queryKey: followKeys.following(userId),
    queryFn: async () => {
      const response = await FollowAPI.getFollowing(userId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook pour suivre un utilisateur
 */
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (followedId: string) => {
      const response = await FollowAPI.followUser(followedId);
      return response.data;
    },
    onSuccess: (_, followedId) => {
      // Mettre à jour immédiatement le statut de suivi dans le cache
      queryClient.setQueryData(followKeys.status(followedId), { isFollowing: true });
      
      // Invalider les requêtes concernées
      queryClient.invalidateQueries({ 
        queryKey: followKeys.counts() 
      });
      queryClient.invalidateQueries({ 
        queryKey: followKeys.following() 
      });
      
      // Si nécessaire, invalider également les compteurs de l'utilisateur suivi
      queryClient.invalidateQueries({ 
        queryKey: followKeys.counts(followedId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followKeys.followers(followedId) 
      });
    }
  });
};

/**
 * Hook pour ne plus suivre un utilisateur
 */
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (followedId: string) => {
      const response = await FollowAPI.unfollowUser(followedId);
      return response.data;
    },
    onSuccess: (_, followedId) => {
      // Mettre à jour immédiatement le statut de suivi dans le cache
      queryClient.setQueryData(followKeys.status(followedId), { isFollowing: false });
      
      // Invalider les requêtes concernées
      queryClient.invalidateQueries({ 
        queryKey: followKeys.counts() 
      });
      queryClient.invalidateQueries({ 
        queryKey: followKeys.following() 
      });
      
      // Si nécessaire, invalider également les compteurs de l'utilisateur qui n'est plus suivi
      queryClient.invalidateQueries({ 
        queryKey: followKeys.counts(followedId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followKeys.followers(followedId) 
      });
    }
  });
};