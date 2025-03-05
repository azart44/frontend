import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as PlaylistAPI from '../api/playlist';
import { PlaylistFormData } from '../types/PlaylistTypes';

// Clés de cache pour React Query
export const playlistKeys = {
  all: ['playlists'] as const,
  lists: () => [...playlistKeys.all, 'list'] as const,
  list: (userId: string) => [...playlistKeys.lists(), userId] as const,
  details: () => [...playlistKeys.all, 'detail'] as const,
  detail: (id: string) => [...playlistKeys.details(), id] as const,
};

/**
 * Hook pour récupérer les playlists d'un utilisateur
 */
export const useUserPlaylists = (userId?: string) => {
  return useQuery({
    queryKey: playlistKeys.list(userId || 'me'),
    queryFn: async () => {
      const response = await PlaylistAPI.getUserPlaylists(userId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer une playlist spécifique avec ses pistes
 */
export const usePlaylist = (playlistId?: string) => {
  return useQuery({
    queryKey: playlistKeys.detail(playlistId || ''),
    queryFn: async () => {
      if (!playlistId) throw new Error('Playlist ID is required');
      const response = await PlaylistAPI.getPlaylistById(playlistId);
      return response.data;
    },
    enabled: !!playlistId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook pour créer une nouvelle playlist
 */
export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playlistData: PlaylistFormData) => 
      PlaylistAPI.createPlaylist(playlistData),
    onSuccess: () => {
      // Invalider les requêtes pour recharger la liste des playlists
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
    },
  });
};

/**
 * Hook pour mettre à jour une playlist
 */
export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playlistData: PlaylistFormData) => 
      PlaylistAPI.updatePlaylist(playlistData),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      if (variables.playlist_id) {
        queryClient.invalidateQueries({ 
          queryKey: playlistKeys.detail(variables.playlist_id) 
        });
      }
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
    },
  });
};

/**
 * Hook pour supprimer une playlist
 */
export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playlistId: string) => PlaylistAPI.deletePlaylist(playlistId),
    onSuccess: (_, playlistId) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ 
        queryKey: playlistKeys.detail(playlistId) 
      });
      queryClient.invalidateQueries({ queryKey: playlistKeys.lists() });
    },
  });
};