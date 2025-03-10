// src/contexts/AudioContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Track } from '../types/TrackTypes';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

// Interface mise à jour pour inclure toutes les propriétés utilisées
export interface AudioContextType {
  // États
  isPlaying: boolean;
  currentTrackId: string | null;
  currentTrack: Track | null;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  trackQueue: Track[];
  
  // Méthodes
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  changeVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue?: (track: Track) => void;
  clearQueue?: () => void;
}

// Valeurs par défaut du contexte
const defaultContext: AudioContextType = {
  isPlaying: false,
  currentTrackId: null,
  currentTrack: null,
  duration: 0,
  currentTime: 0,
  volume: 0.8,  // Valeur par défaut
  isLoading: false,
  error: null,
  trackQueue: [],
  
  playTrack: () => {},
  togglePlay: () => {},
  seek: () => {},
  changeVolume: () => {},
  nextTrack: () => {},
  previousTrack: () => {}
};

// Création du contexte
const AudioContext = createContext<AudioContextType>(defaultContext);

// Hook pour utiliser le contexte audio
export const useAudioContext = () => useContext(AudioContext);

// Provider du contexte audio
export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Utilisation du hook useAudioPlayer
  const { 
    isPlaying, 
    currentTrackId, 
    currentTrack, 
    duration, 
    currentTime,
    volume,
    isLoading,
    error,
    trackQueue,
    playTrack, 
    togglePlay, 
    seek,
    changeVolume,
    nextTrack,
    previousTrack
  } = useAudioPlayer();
  
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
    trackQueue,
    playTrack,
    togglePlay,
    seek,
    changeVolume,
    nextTrack,
    previousTrack
  };
  
  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};