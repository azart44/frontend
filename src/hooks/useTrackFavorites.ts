import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TrackFavoritesAPI from '../api/trackFavorites';
import * as TrackAPI from '../api/track';
import { Track } from '../types/TrackTypes';

// Clés de cache pour React Query
export const favoriteKeys = {
  all: ['favorites'] as const,
  userFavorites: () => [...favoriteKeys.all, 'user'] as const,
  trackFavoriteStatus: (trackId: string) => [...favoriteKeys.all, 'status', trackId] as const,
};

/**
 * Hook pour récupérer les tracks favorites de l'utilisateur courant
 */
export const useUserFavorites = () => {
  return useQuery({
    queryKey: favoriteKeys.userFavorites(),
    queryFn: async () => {
      const response = await TrackAPI.getFavoriteTracks();
      return {
        favoriteTracks: response.data.tracks || [],
        totalFavorites: response.data.count || 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook pour vérifier si l'utilisateur a ajouté une track à ses favoris
 */
export const useFavoriteStatus = (trackId: string) => {
  return useQuery({
    queryKey: favoriteKeys.trackFavoriteStatus(trackId),
    queryFn: async () => {
      const response = await TrackFavoritesAPI.checkFavoriteStatus(trackId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!trackId,
  });
};

/**
 * Hook pour ajouter/retirer une track des favoris
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      trackId, 
      isFavorite 
    }: { 
      trackId: string; 
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        return TrackFavoritesAPI.removeFavorite(trackId);
      } else {
        return TrackFavoritesAPI.addFavorite(trackId);
      }
    },
    onSuccess: (_, variables) => {
      // Invalider le statut de favori pour cette track
      queryClient.invalidateQueries({ 
        queryKey: favoriteKeys.trackFavoriteStatus(variables.trackId) 
      });
      
      // Invalider la liste des favoris de l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: favoriteKeys.userFavorites() 
      });
      
      // Invalider les données de la track spécifique
      queryClient.invalidateQueries({
        queryKey: ['tracks', variables.trackId]
      });
    },
  });
};