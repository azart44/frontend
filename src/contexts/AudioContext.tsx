// src/contexts/AudioContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/TrackTypes';

// Interface pour le contexte audio
interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  changeVolume: (volume: number) => void;
  setCurrentPlaylist: (tracks: Track[], startIndex?: number) => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
}

// Création du contexte avec des valeurs par défaut
const AudioContext = createContext<AudioContextType>({
  currentTrack: null,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  isLoading: false,
  error: null,
  playTrack: () => {},
  togglePlay: () => {},
  seek: () => {},
  changeVolume: () => {},
  setCurrentPlaylist: () => {},
  skipToNext: () => {},
  skipToPrevious: () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useAudioContext = () => useContext(AudioContext);

// Provider du contexte
export const AudioProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Utiliser le hook audio player
  const {
    isPlaying,
    currentTrack,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    playTrack: playTrackFromHook,
    togglePlay: togglePlayFromHook,
    changeVolume: changeVolumeFromHook,
    seek: seekFromHook,
  } = useAudioPlayer({
    onEnded: () => {
      // Passer à la piste suivante quand une piste se termine
      if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        playTrackFromHook(playlist[nextIndex]);
      }
    },
    onError: (err) => {
      console.error("Erreur de lecture audio:", err);
      
      // Essayer de passer à la piste suivante en cas d'erreur
      if (playlist.length > 0 && currentIndex < playlist.length - 1) {
        console.log("Tentative de passer à la piste suivante suite à une erreur");
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        playTrackFromHook(playlist[nextIndex]);
      }
    },
    // Désactiver l'autoplay pour éviter les problèmes CORS
    autoplay: false
  });

  // Définir la liste de lecture actuelle
  const setCurrentPlaylist = (tracks: Track[], startIndex: number = 0) => {
    if (tracks.length === 0) return;
    
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    
    // Jouer la piste de départ
    if (startIndex >= 0 && startIndex < tracks.length) {
      playTrackFromHook(tracks[startIndex]);
    }
  };

  // Passer à la piste suivante
  const skipToNext = () => {
    if (playlist.length === 0 || currentIndex >= playlist.length - 1) return;
    
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    playTrackFromHook(playlist[nextIndex]);
  };

  // Revenir à la piste précédente
  const skipToPrevious = () => {
    // Si on est au début de la piste actuelle, revenir à la précédente
    // Sinon, recommencer la piste actuelle
    if (currentTime > 3 && currentTrack) {
      seekFromHook(0);
      return;
    }
    
    if (playlist.length === 0 || currentIndex <= 0) return;
    
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    playTrackFromHook(playlist[prevIndex]);
  };

  // Mettre à jour l'index courant quand une nouvelle piste est jouée
  useEffect(() => {
    if (currentTrack && playlist.length > 0) {
      const index = playlist.findIndex(track => track.track_id === currentTrack.track_id);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [currentTrack, playlist, currentIndex]);

  // Jouer une piste spécifique
  const playTrack = (track: Track) => {
    // Vérifier si la piste est dans la playlist actuelle
    const index = playlist.findIndex(t => t.track_id === track.track_id);
    
    if (index !== -1) {
      // La piste est dans la playlist, mettre à jour l'index
      setCurrentIndex(index);
    } else {
      // La piste n'est pas dans la playlist, créer une nouvelle liste avec cette piste
      setPlaylist([track]);
      setCurrentIndex(0);
    }
    
    // Jouer la piste
    playTrackFromHook(track);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        duration,
        currentTime,
        volume,
        isLoading,
        error,
        playTrack,
        togglePlay: togglePlayFromHook,
        seek: seekFromHook,
        changeVolume: changeVolumeFromHook,
        setCurrentPlaylist,
        skipToNext,
        skipToPrevious,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};