import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/TrackTypes';

// Interface pour le contexte audio
interface AudioContextType {
  isPlaying: boolean;
  currentTrackId: string | null;
  currentTrack: Track | null;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  changeVolume: (volume: number) => void;
  seek: (time: number) => void;
}

// Créer le contexte avec des valeurs par défaut
const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  currentTrackId: null,
  currentTrack: null,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  isLoading: false,
  error: null,
  playTrack: () => {},
  togglePlay: () => {},
  changeVolume: () => {},
  seek: () => {},
});

// Props pour le fournisseur de contexte
interface AudioProviderProps {
  children: ReactNode;
}

// Fournisseur du contexte audio
export const AudioProvider = ({ children }: AudioProviderProps) => {
  const {
    isPlaying,
    currentTrackId,
    currentTrack,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    loadTrack,
    togglePlay,
    changeVolume,
    seek,
  } = useAudioPlayer({
    onEnded: () => {
      // Logique de fin de lecture, par exemple passer à la piste suivante
      console.log('Lecture terminée');
    }
  });

  // Fonction pour jouer une piste
  const playTrack = (track: Track) => {
    if (track.presigned_url) {
      loadTrack(track);
    } else {
      console.error('La piste n\'a pas d\'URL présignée');
    }
  };

  const contextValue = {
    isPlaying,
    currentTrackId,
    currentTrack,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    playTrack,
    togglePlay,
    changeVolume,
    seek,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte audio
export const useAudioContext = () => useContext(AudioContext);