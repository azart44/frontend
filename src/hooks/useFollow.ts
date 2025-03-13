import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as BeatSwipeAPI from '../api/beatSwipe';
import { Track } from '../types/TrackTypes';
import { useState, useRef, useCallback, useEffect } from 'react';

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
  const [trackQueue, setTrackQueue] = useState<Track[]>(initialTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processingAction, setProcessingAction] = useState(false);
  const recordAction = useRecordSwipeAction();
  
  // Référence pour stocker si on a besoin de charger plus de pistes
  const needsMoreTracks = useRef(false);
  
  // Fonction pour ajouter des pistes à la queue
  const addTracksToQueue = useCallback((tracks: Track[]) => {
    if (!tracks || tracks.length === 0) return;
    
    setTrackQueue(prev => {
      // Filtrer les pistes déjà présentes dans la queue pour éviter les doublons
      const existingIds = new Set(prev.map(track => track.track_id));
      const newTracks = tracks.filter(track => !existingIds.has(track.track_id));
      
      console.log(`Ajout de ${newTracks.length} nouvelles pistes à la queue`);
      return [...prev, ...newTracks];
    });
    
    // Si aucune piste n'est actuellement active, initialiser à 0
    if (currentIndex === -1) {
      setCurrentIndex(0);
    }
  }, [currentIndex]);
  
  // Effet pour vérifier si plus de pistes sont nécessaires
  useEffect(() => {
    if (trackQueue.length > 0 && currentIndex >= trackQueue.length - 3) {
      // Si nous approchons de la fin de la queue, signaler qu'il faut charger plus de pistes
      needsMoreTracks.current = true;
    } else {
      needsMoreTracks.current = false;
    }
  }, [trackQueue.length, currentIndex]);
  
  // Récupérer la piste courante
  const currentTrack = currentIndex >= 0 && currentIndex < trackQueue.length 
    ? trackQueue[currentIndex] 
    : null;
  
  // Fonction pour gérer les actions de swipe avec protection contre les actions multiples
  const handleSwipeAction = useCallback((action: 'right' | 'left' | 'down') => {
    if (!currentTrack || processingAction) return;
    
    // Marquer comme en cours de traitement
    setProcessingAction(true);
    
    // Enregistrer l'action
    recordAction.mutate(
      {
        trackId: currentTrack.track_id,
        action
      },
      {
        onSettled: () => {
          // Passer à la piste suivante
          setCurrentIndex(prev => prev + 1);
          
          // Réinitialiser le verrou
          setProcessingAction(false);
        }
      }
    );
  }, [currentTrack, recordAction, processingAction]);
  
  // Fonction pour traiter le swipe à droite (like)
  const handleSwipeRight = useCallback(() => {
    handleSwipeAction('right');
  }, [handleSwipeAction]);
  
  // Fonction pour traiter le swipe à gauche (skip)
  const handleSwipeLeft = useCallback(() => {
    handleSwipeAction('left');
  }, [handleSwipeAction]);
  
  // Fonction pour traiter le swipe vers le bas (ajouter aux favoris)
  const handleSwipeDown = useCallback(() => {
    handleSwipeAction('down');
  }, [handleSwipeAction]);
  
  // Réinitialiser la queue
  const resetQueue = useCallback(() => {
    setTrackQueue([]);
    setCurrentIndex(0);
    setProcessingAction(false);
  }, []);
  
  // Vérifier si la file d'attente a besoin d'être complétée
  const needsRefill = needsMoreTracks.current;
  
  return {
    trackQueue,
    currentTrack,
    currentIndex,
    addTracksToQueue,
    handleSwipeRight,
    handleSwipeLeft,
    handleSwipeDown,
    isActionLoading: processingAction || recordAction.isPending,
    resetQueue,
    hasMoreTracks: currentIndex < trackQueue.length,
    needsRefill
  };
};