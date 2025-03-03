import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as TrackAPI from '../api/track';
import { Track, TrackFormData } from '../types/TrackTypes';
import { uploadData } from 'aws-amplify/storage';

// Clés de cache pour React Query
export const trackKeys = {
  all: ['tracks'] as const,
  track: (id: string) => [...trackKeys.all, id] as const,
  userTracks: (userId: string) => [...trackKeys.all, 'user', userId] as const,
  search: (params: Record<string, any>) => [...trackKeys.all, 'search', JSON.stringify(params)] as const,
};

/**
 * Hook pour récupérer les pistes d'un utilisateur
 */
export const useUserTracks = (userId?: string, filters?: Record<string, string>) => {
  return useQuery({
    queryKey: trackKeys.userTracks(userId || 'me'),
    queryFn: async () => {
      const response = await TrackAPI.getTracks(userId, filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
};

/**
 * Hook pour récupérer une piste spécifique
 */
export const useTrackById = (trackId?: string) => {
  return useQuery({
    queryKey: trackKeys.track(trackId || ''),
    queryFn: async () => {
      if (!trackId) throw new Error('Track ID is required');
      const response = await TrackAPI.getTrackById(trackId);
      return response.data;
    },
    enabled: !!trackId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour créer une nouvelle piste
 */
export const useCreateTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      formData, 
      file 
    }: { 
      formData: TrackFormData; 
      file: File 
    }) => {
      // 1. Créer les métadonnées de la piste et obtenir une URL présignée
      const createResponse = await TrackAPI.createTrack({
        ...formData,
        fileName: file.name,
        fileType: file.type,
      });
      
      const { trackId, uploadUrl } = createResponse.data;
      
      // 2. Upload du fichier audio directement vers S3 avec l'URL présignée
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      return { trackId };
    },
    onSuccess: (data, variables, context) => {
      // Invalider les requêtes de pistes
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
      return data;
    },
  });
};

/**
 * Hook pour mettre à jour une piste
 */
export const useUpdateTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackId, data }: { trackId: string; data: Partial<TrackFormData> }) => 
      TrackAPI.updateTrack(trackId, data),
    onSuccess: (data, variables) => {
      // Invalider les requêtes de pistes
      queryClient.invalidateQueries({ 
        queryKey: trackKeys.track(variables.trackId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: trackKeys.all
      });
    },
  });
};

/**
 * Hook pour supprimer une piste
 */
export const useDeleteTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackId: string) => TrackAPI.deleteTrack(trackId),
    onSuccess: (data, variables) => {
      // Invalider les requêtes de pistes
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });
};

/**
 * Hook pour rechercher des pistes avec des critères spécifiques
 */
export const useSearchTracks = (params: Record<string, string | number>) => {
  return useQuery({
    queryKey: trackKeys.search(params),
    queryFn: async () => {
      const response = await TrackAPI.searchTracks(params);
      return response.data;
    },
    enabled: Object.keys(params).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};