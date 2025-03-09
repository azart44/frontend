// src/contexts/AudioContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/TrackTypes';

// Interface définissant le contenu du contexte
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
  changeVolume: (newVolume: number) => void;
  seek: (time: number) => void;
}

// Création du contexte avec des valeurs par défaut
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
  seek: () => {}
});

// Hook pour utiliser le contexte
export const useAudioContext = () => useContext(AudioContext);

// Propriétés du provider
interface AudioProviderProps {
  children: ReactNode;
}

// Composant Provider
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  // Utilisation du hook personnalisé pour la lecture audio
  const {
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
    seek
  } = useAudioPlayer({
    onEnded: () => {
      console.log('Piste terminée');
      // Ici, vous pourriez ajouter une logique pour jouer la piste suivante
    },
    onError: (error) => {
      console.error('Erreur de lecture audio:', error);
    }
  });

  // Valeur du contexte
  const contextValue: AudioContextType = {
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
    seek
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};