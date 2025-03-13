import React from 'react';
// Modification à apporter au fichier src/hooks/useBeatSwipe.ts pour corriger useLocalSwipeQueue

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as BeatSwipeAPI from '../api/beatSwipe';
import { Track } from '../types/TrackTypes';
import { useState, useRef, useCallback } from 'react';

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
  const recordAction = useRecordSwipeAction();
  const processingSwipe = useRef(false); // Référence pour éviter les swipes multiples
  
  // Fonction pour ajouter des pistes à la queue
  const addTracksToQueue = useCallback((tracks: Track[]) => {
    setTrackQueue(prev => {
      // Filtrer les pistes déjà présentes dans la queue pour éviter les doublons
      const existingIds = new Set(prev.map(track => track.track_id));
      const newTracks = tracks.filter(track => !existingIds.has(track.track_id));
      return [...prev, ...newTracks];
    });
  }, []);
  
  // Récupérer la piste courante
  const currentTrack = trackQueue[currentIndex] || null;
  
  // Fonction pour gérer les actions de swipe avec protection contre les actions multiples
  const handleSwipeAction = useCallback((action: 'right' | 'left' | 'down') => {
    if (!currentTrack || processingSwipe.current) return;
    
    // Marquer comme en cours de traitement
    processingSwipe.current = true;
    
    // Enregistrer l'action
    recordAction.mutate(
      {
        trackId: currentTrack.track_id,
        action
      },
      {
        onSettled: () => {
          // Passer à la piste suivante et réinitialiser le verrou
          setCurrentIndex(prev => prev + 1);
          processingSwipe.current = false;
        }
      }
    );
  }, [currentTrack, recordAction]);
  
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
  
  // État de chargement des actions de swipe
  const isActionLoading = recordAction.isPending;
  
  // Réinitialiser la queue
  const resetQueue = useCallback(() => {
    setTrackQueue([]);
    setCurrentIndex(0);
    processingSwipe.current = false;
  }, []);
  
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