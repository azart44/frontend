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
      try {
        // Étape 1: Récupérer les IDs des pistes favorites
        const idsResponse = await TrackFavoritesAPI.getUserFavoriteIds();
        console.log('IDs des favoris récupérés:', idsResponse.data);
        
        const trackIds = idsResponse.data.trackIds || [];
        
        if (trackIds.length === 0) {
          return {
            favoriteTracks: [],
            totalFavorites: 0
          };
        }
        
        // Étape 2: Récupérer les détails des pistes à partir des IDs
        const tracksResponse = await TrackAPI.getTracksByIds(trackIds);
        console.log('Détails des pistes favoris récupérés:', tracksResponse.data);
        
        return {
          favoriteTracks: tracksResponse.data.tracks || [],
          totalFavorites: trackIds.length
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute (réduit pour des tests plus faciles)
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
    staleTime: 1 * 60 * 1000, // 1 minute
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
        const response = await TrackFavoritesAPI.removeFavorite(trackId);
        console.log('Piste retirée des favoris:', response.data);
        return response;
      } else {
        const response = await TrackFavoritesAPI.addFavorite(trackId);
        console.log('Piste ajoutée aux favoris:', response.data);
        return response;
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