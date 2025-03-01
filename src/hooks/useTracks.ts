import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTracks, createTrack, updateTrack, deleteTrack } from '../api/track';

// Clés de cache pour React Query
export const trackKeys = {
  all: ['tracks'] as const,
  track: (id: string) => [...trackKeys.all, id] as const,
  userTracks: (userId: string) => [...trackKeys.all, 'user', userId] as const,
};

export const useUserTracks = (userId?: string) => {
  return useQuery({
    queryKey: trackKeys.userTracks(userId || 'me'),
    queryFn: () => getTracks(userId).then((response: any) => response.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
};

export const useCreateTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackData: any) => createTrack(trackData),
    onSuccess: (data, variables) => {
      // Invalider les requêtes de pistes
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });
};

export const useUpdateTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({trackId, data}: {trackId: string, data: any}) => 
      updateTrack(trackId, data),
    onSuccess: (data, variables) => {
      // Invalider les requêtes de pistes
      queryClient.invalidateQueries({ 
        queryKey: trackKeys.track(variables.trackId) 
      });
    },
  });
};

export const useDeleteTrack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackId: string) => deleteTrack(trackId),
    onSuccess: (data, variables) => {
      // Invalider les requêtes de pistes
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });
};