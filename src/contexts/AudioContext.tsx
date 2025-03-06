import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/TrackTypes';
import { getTrackById } from '../api/track';
import AudioPlayer from '../components/common/AudioPlayer';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  currentTime: number; // Propriété ajoutée
  duration: number;    // Propriété ajoutée
  seek: (time: number) => void; // Propriété ajoutée
}

// Créer le contexte avec une valeur par défaut
const AudioContext = createContext<AudioContextType | undefined>(undefined);

/**
 * Provider pour le contexte audio
 * Gère la lecture, la pause, la file d'attente et l'état du lecteur audio
 */
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  
  // Utiliser le hook personnalisé pour le lecteur audio
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    loadTrack,
    togglePlay: toggleAudioPlay,
    seek,
    changeVolume
  } = useAudioPlayer({
    onEnded: () => {
      // Passer à la piste suivante lorsque la lecture est terminée
      if (queueIndex < queue.length - 1) {
        playTrackAtIndex(queueIndex + 1);
      }
    }
  });
  
  // Afficher ou cacher le lecteur audio
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Charger une piste à partir de l'API
  const loadTrackFromApi = useCallback(async (trackId: string) => {
    try {
      const response = await getTrackById(trackId);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la piste:', error);
      return null;
    }
  }, []);
  
  // Jouer une piste à un index spécifique de la file d'attente
  const playTrackAtIndex = useCallback(async (index: number) => {
    if (index >= 0 && index < queue.length) {
      const trackToPlay = queue[index];
      
      try {
        // Vérifier si l'URL présignée est disponible
        if (!trackToPlay.presigned_url) {
          // Essayer de charger la piste depuis l'API
          const updatedTrack = await loadTrackFromApi(trackToPlay.track_id);
          
          if (updatedTrack && updatedTrack.presigned_url) {
            // Mettre à jour la piste dans la file d'attente
            const updatedQueue = [...queue];
            updatedQueue[index] = updatedTrack;
            setQueue(updatedQueue);
            
            // Charger et jouer la piste mise à jour
            await loadTrack(updatedTrack);
          } else {
            console.error('Impossible de charger l\'URL présignée pour la piste:', trackToPlay.track_id);
            return;
          }
        } else {
          // Charger et jouer la piste directement
          await loadTrack(trackToPlay);
        }
        
        setQueueIndex(index);
        setShowPlayer(true);
      } catch (error) {
        console.error('Erreur lors de la lecture de la piste:', error);
      }
    }
  }, [queue, loadTrack, loadTrackFromApi]);
  
  // Jouer une piste
  const playTrack = useCallback((track: Track) => {
    // Vérifier si la piste est déjà dans la file d'attente
    const existingIndex = queue.findIndex(t => t.track_id === track.track_id);
    
    if (existingIndex >= 0) {
      // Si la piste est déjà dans la file d'attente, la jouer
      playTrackAtIndex(existingIndex);
    } else {
      // Sinon, l'ajouter à la file d'attente et la jouer
      const newQueue = [...queue, track];
      setQueue(newQueue);
      playTrackAtIndex(newQueue.length - 1);
    }
  }, [queue, playTrackAtIndex]);
  
  // Mettre en pause la lecture
  const pauseTrack = useCallback(() => {
    if (isPlaying) {
      toggleAudioPlay();
    }
  }, [isPlaying, toggleAudioPlay]);
  
  // Passer à la piste suivante
  const nextTrack = useCallback(() => {
    if (queueIndex < queue.length - 1) {
      playTrackAtIndex(queueIndex + 1);
    }
  }, [queueIndex, queue.length, playTrackAtIndex]);
  
  // Passer à la piste précédente
  const previousTrack = useCallback(() => {
    if (queueIndex > 0) {
      playTrackAtIndex(queueIndex - 1);
    }
  }, [queueIndex, playTrackAtIndex]);
  
  // Ajouter une piste à la file d'attente
  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
    
    // Si aucune piste n'est en cours de lecture, commencer la lecture
    if (queue.length === 0) {
      playTrack(track);
    }
  }, [queue.length, playTrack]);
  
  // Vider la file d'attente
  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
    setShowPlayer(false);
    
    // Arrêter la lecture
    pauseTrack();
  }, [pauseTrack]);
  
  // Fermer le lecteur
  const closePlayer = useCallback(() => {
    setShowPlayer(false);
    pauseTrack();
  }, [pauseTrack]);
  
  // Valeur du contexte
  const contextValue: AudioContextType = {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    togglePlay: toggleAudioPlay,
    nextTrack,
    previousTrack,
    addToQueue,
    clearQueue,
    currentTime,  // Propriété ajoutée
    duration,     // Propriété ajoutée
    seek          // Propriété ajoutée
  };
  
  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      
      {/* Lecteur audio global */}
      {showPlayer && currentTrack && (
        <AudioPlayer
          track={currentTrack}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          onClose={closePlayer}
          onPlayPause={toggleAudioPlay}
          onSeek={seek}
          onVolumeChange={changeVolume}
          onNext={queue.length > 1 ? nextTrack : undefined}
          onPrevious={queue.length > 1 ? previousTrack : undefined}
        />
      )}
    </AudioContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte audio
 * @returns Contexte audio
 */
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext doit être utilisé à l\'intérieur d\'un AudioProvider');
  }
  return context;
};