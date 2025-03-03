import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TrackLikesAPI from '../api/trackLikes';
import * as TrackAPI from '../api/track'; // Import de l'API track
import { Track } from '../types/TrackTypes';

// Clés de cache pour React Query
export const likeKeys = {
  all: ['likes'] as const,
  userLikes: (userId?: string) => [...likeKeys.all, 'user', userId || 'me'] as const,
  trackLikeStatus: (trackId: string) => [...likeKeys.all, 'status', trackId] as const,
};

/**
 * Hook pour récupérer les tracks likées par l'utilisateur courant
 */
export const useUserLikes = () => {
  return useQuery({
    queryKey: likeKeys.userLikes(),
    queryFn: async () => {
      // Récupérer les pistes likées directement via l'API tracks avec le paramètre likedBy
      const response = await TrackAPI.getLikedTracks();
      return {
        likedTracks: response.data.tracks || [],
        totalLikes: response.data.count || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer les tracks likées par un utilisateur spécifique
 */
export const useUserLikesById = (userId: string) => {
  return useQuery({
    queryKey: likeKeys.userLikes(userId),
    queryFn: async () => {
      // Récupérer les pistes likées directement via l'API tracks avec le paramètre likedBy
      const response = await TrackAPI.getLikedTracksByUserId(userId);
      return {
        likedTracks: response.data.tracks || [],
        totalLikes: response.data.count || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
};

/**
 * Hook pour vérifier si l'utilisateur a liké une track spécifique
 */
export const useLikeStatus = (trackId: string) => {
  return useQuery({
    queryKey: likeKeys.trackLikeStatus(trackId),
    queryFn: async () => {
      const response = await TrackLikesAPI.checkLikeStatus(trackId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!trackId,
  });
};

/**
 * Hook pour liker/unliker une track
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      trackId, 
      isLiked 
    }: { 
      trackId: string; 
      isLiked: boolean;
    }) => {
      if (isLiked) {
        return TrackLikesAPI.removeLike(trackId);
      } else {
        return TrackLikesAPI.addLike(trackId);
      }
    },
    onSuccess: (_, variables) => {
      // Invalider le statut de like pour cette track
      queryClient.invalidateQueries({ 
        queryKey: likeKeys.trackLikeStatus(variables.trackId) 
      });
      
      // Invalider la liste des likes de l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: likeKeys.userLikes() 
      });
      
      // Invalider les données de la track spécifique
      queryClient.invalidateQueries({
        queryKey: ['tracks', variables.trackId]
      });
      
      // Invalider toutes les listes de tracks qui pourraient contenir cette track
      queryClient.invalidateQueries({
        queryKey: ['tracks']
      });
    },
  });
};