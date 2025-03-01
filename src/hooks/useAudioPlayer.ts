import { useState, useEffect, useRef, useCallback } from 'react';
import { getTrackById } from '../api/track';

interface AudioPlayerOptions {
  onEnded?: () => void;
  onError?: (error: any) => void;
  autoplay?: boolean;
}

export function useAudioPlayer(options: AudioPlayerOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  // Initialiser l'élément audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Événements audio
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
        setIsLoading(false);
        
        if (options.autoplay) {
          audioRef.current?.play()
            .then(() => setIsPlaying(true))
            .catch(handlePlayError);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (options.onEnded) options.onEnded();
      });
      
      audioRef.current.addEventListener('error', (e) => {
        setIsLoading(false);
        setError('Erreur lors du chargement de l\'audio');
        if (options.onError) options.onError(e);
      });
    }
    
    // Nettoyer les événements à la sortie
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [options]);
  
  // Gestion des erreurs de lecture
  const handlePlayError = useCallback((error: any) => {
    console.error('Erreur de lecture audio:', error);
    setIsPlaying(false);
    setError('Impossible de lire ce fichier audio');
    if (options.onError) options.onError(error);
  }, [options]);
  
  // Mise à jour de la progression
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000) as unknown as number;
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);
  
  // Charger une piste
  const loadTrack = useCallback(async (trackId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Arrêter la lecture en cours
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      // Récupérer l'URL signée
      const response = await getTrackById(trackId);
      const { presigned_url } = response.data;
      
      if (!presigned_url) {
        throw new Error('Impossible de charger l\'URL du fichier audio');
      }
      
      // Charger la nouvelle piste
      if (audioRef.current) {
        audioRef.current.src = presigned_url;
        audioRef.current.load();
        setCurrentTrackId(trackId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la piste:', error);
      setError('Erreur lors du chargement de la piste');
      if (options.onError) options.onError(error);
    }
  }, [options]);
  
  // Lecture/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(handlePlayError);
    }
  }, [isPlaying, handlePlayError]);
  
  // Définir le volume
  const changeVolume = useCallback((value: number) => {
    if (!audioRef.current) return;
    
    const newVolume = Math.max(0, Math.min(1, value));
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  }, []);
  
  // Définir la position
  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    
    const validSeconds = Math.max(0, Math.min(seconds, duration));
    audioRef.current.currentTime = validSeconds;
    setCurrentTime(validSeconds);
  }, [duration]);
  
  return {
    isPlaying,
    currentTrackId,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    loadTrack,
    togglePlay,
    changeVolume,
    seek,
  };
}