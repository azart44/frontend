import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as BeatSwipeAPI from '../api/beatSwipe';
import { Track } from '../types/TrackTypes';

// Clés de cache pour React Query
export const beatSwipeKeys = {
  all: ['beatswipe'] as const,
  recommendations: () => [...beatSwipeKeys.all, 'recommendations'] as const,
  matches: () => [...beatSwipeKeys.all, 'matches'] as const
};

/**
 * Hook pour récupérer les recommandations de beats pour le swipe
 */
export const useSwipeRecommendations = () => {
  return useQuery({
    queryKey: beatSwipeKeys.recommendations(),
    queryFn: async () => {
      const response = await BeatSwipeAPI.getSwipeRecommendations();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour enregistrer une action de swipe (like, skip, favorite)
 */
export const useRecordSwipeAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: BeatSwipeAPI.BeatSwipeAction) => {
      const response = await BeatSwipeAPI.recordSwipeAction(action);
      return response.data;
    },
    onSuccess: () => {
      // Invalider les matches si nécessaire (en cas de swipe à droite / like)
      queryClient.invalidateQueries({ queryKey: beatSwipeKeys.matches() });
    }
  });
};

/**
 * Hook pour récupérer les matches BeatSwipe de l'utilisateur
 */
export const useSwipeMatches = () => {
  return useQuery({
    queryKey: beatSwipeKeys.matches(),
    queryFn: async () => {
      const response = await BeatSwipeAPI.getSwipeMatches();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook pour gérer un ensemble de recommandations chargées en mémoire
 * avec gestion d'état optimisée pour l'UX de swipe
 */
export const useLocalSwipeQueue = (initialTracks: Track[] = []) => {
  const [trackQueue, setTrackQueue] = React.useState<Track[]>(initialTracks);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const recordAction = useRecordSwipeAction();
  
  // Fonction pour ajouter des pistes à la queue
  const addTracksToQueue = (tracks: Track[]) => {
    setTrackQueue(prev => [...prev, ...tracks]);
  };
  
  // Récupérer la piste courante
  const currentTrack = trackQueue[currentIndex] || null;
  
  // Fonction pour traiter le swipe à droite (like)
  const handleSwipeRight = () => {
    if (!currentTrack) return;
    
    // Enregistrer l'action
    recordAction.mutate({
      trackId: currentTrack.track_id,
      action: 'right'
    });
    
    // Passer à la piste suivante
    setCurrentIndex(prev => prev + 1);
  };
  
  // Fonction pour traiter le swipe à gauche (skip)
  const handleSwipeLeft = () => {
    if (!currentTrack) return;
    
    // Enregistrer l'action
    recordAction.mutate({
      trackId: currentTrack.track_id,
      action: 'left'
    });
    
    // Passer à la piste suivante
    setCurrentIndex(prev => prev + 1);
  };
  
  // Fonction pour traiter le swipe vers le bas (ajouter aux favoris)
  const handleSwipeDown = () => {
    if (!currentTrack) return;
    
    // Enregistrer l'action
    recordAction.mutate({
      trackId: currentTrack.track_id,
      action: 'down'
    });
    
    // Passer à la piste suivante
    setCurrentIndex(prev => prev + 1);
  };
  
  // État de chargement des actions de swipe
  const isActionLoading = recordAction.isPending;
  
  // Réinitialiser la queue
  const resetQueue = () => {
    setTrackQueue([]);
    setCurrentIndex(0);
  };
  
  return {
    trackQueue,
    currentTrack,
    currentIndex,
    addTracksToQueue,
    handleSwipeRight,
    handleSwipeLeft,
    handleSwipeDown,
    isActionLoading,
    resetQueue,
    hasMoreTracks: currentIndex < trackQueue.length
  };
};