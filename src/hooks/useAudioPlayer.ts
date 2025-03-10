// src/hooks/useAudioPlayer.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '../types/TrackTypes';
import { incrementPlayCount } from '../api/track';
import { validatePresignedUrl } from '../utils/audioDebugger';

interface AudioPlayerOptions {
  onEnded?: () => void;
  onError?: (error: any) => void;
  autoplay?: boolean;
}

/**
 * Hook personnalisé pour gérer la lecture audio avec une meilleure gestion des URL présignées
 */
export function useAudioPlayer(options: AudioPlayerOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8); // Volume par défaut à 80%
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackQueue, setTrackQueue] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playCountedRef = useRef<boolean>(false);
  const retryAttemptsRef = useRef<number>(0);
  const maxRetryAttempts = 3;

  // [Previous useEffect and event listener code remains the same]

  // Fonction pour basculer lecture/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      console.error('Élément audio non initialisé');
      return;
    }
    
    try {
      if (isPlaying) {
        // Mettre en pause
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Lancer la lecture
        // Vérifier si une source est définie
        if (!audioRef.current.src || audioRef.current.src === '' || audioRef.current.src === 'about:blank') {
          if (currentTrack?.presigned_url) {
            audioRef.current.src = currentTrack.presigned_url;
            audioRef.current.load();
          } else {
            console.error('Pas de source définie pour la lecture');
            setError('Pas de piste à lire');
            return;
          }
        }
        
        playPromiseRef.current = audioRef.current.play();
        playPromiseRef.current
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Erreur lors de la lecture:', error);
            setError(`Erreur de lecture: ${error.message}`);
            setIsPlaying(false);
          });
      }
    } catch (e: any) {
      console.error('Exception dans togglePlay:', e);
      setError(`Erreur de lecture/pause: ${e.message}`);
    }
  }, [isPlaying, currentTrack]);

  // Changer le volume
  const changeVolume = useCallback((newVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, newVolume));
    
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
    
    setVolume(safeVolume);
  }, []);

  // Déplacer la lecture à un moment spécifique
  const seek = useCallback((time: number) => {
    if (!audioRef.current) {
      console.error('Élément audio non initialisé (seek)');
      return;
    }
    
    const safeTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, [duration]);

  // Configuration d'une nouvelle piste
  const setupNewTrack = useCallback((track: Track) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = volume;
    }
    
    audioRef.current.src = track.presigned_url || '';
    audioRef.current.load();
    
    try {
      playPromiseRef.current = audioRef.current.play();
      playPromiseRef.current
        .then(() => {
          console.log('Lecture démarrée avec succès');
          setIsPlaying(true);
          setCurrentTrackId(track.track_id);
          setCurrentTrack(track);
        })
        .catch((playError) => {
          console.error('Erreur de lecture initiale:', playError);
          
          // Si l'erreur est liée aux restrictions autoplay, on ne considère pas ça comme une erreur fatale
          if (playError.name === "NotAllowedError") {
            console.log("Autoplay bloqué par le navigateur - en attente d'interaction utilisateur");
            setIsPlaying(false);
            setCurrentTrackId(track.track_id);
            setCurrentTrack(track);
            setError(null);
          } else {
            setError(`Erreur de lecture: ${playError.message}`);
            setIsPlaying(false);
          }
        });
    } catch (error: any) {
      console.error('Exception lors de la lecture:', error);
      setError(`Erreur de lecture: ${error.message}`);
      setIsPlaying(false);
    }
  }, [volume]);

  // Charger et jouer une piste
  const loadTrack = useCallback((track: Track) => {
    try {
      console.log('Chargement de la piste:', track.title);
      setIsLoading(true);
      setError(null);
      
      // Vérifier que l'URL présignée existe
      if (!track.presigned_url) {
        console.error("URL présignée manquante pour la piste:", track.title);
        setError("URL présignée manquante pour la piste");
        setIsLoading(false);
        return;
      }
      
      // Vérifier la validité de l'URL présignée
      const urlValidation = validatePresignedUrl(track.presigned_url);
      if (!urlValidation.isValid) {
        console.error(urlValidation.message);
        setError(`Impossible de lire le fichier: ${urlValidation.message}`);
        setIsLoading(false);
        return;
      }
      
      console.log('URL présignée:', track.presigned_url.substring(0, 100) + '...');
      
      // Arrêter la lecture en cours proprement
      if (audioRef.current) {
        const oldAudio = audioRef.current;
        oldAudio.pause();
        
        // Nettoyer l'audio avant d'assigner une nouvelle source
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              oldAudio.src = '';
              oldAudio.load(); // Force le nettoyage
              
              // Charger et jouer la nouvelle piste après le nettoyage
              setTimeout(() => setupNewTrack(track), 50);
            })
            .catch(() => {
              oldAudio.src = '';
              oldAudio.load();
              setTimeout(() => setupNewTrack(track), 50);
            });
        } else {
          oldAudio.src = '';
          oldAudio.load();
          setTimeout(() => setupNewTrack(track), 50);
        }
      } else {
        // Pas d'audio en cours, charger directement
        setupNewTrack(track);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement de la piste:', error);
      setError(`Erreur lors du chargement de la piste: ${error.message}`);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [setupNewTrack]);

  // Jouer une piste avec une file d'attente optionnelle
  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    console.log('Demande de lecture directe:', track.title);
    
    // Si une file d'attente est fournie, la mettre à jour
    if (queue) {
      setTrackQueue(queue);
    } else if (trackQueue.length === 0) {
      // Si pas de file d'attente existante, créer une avec la piste actuelle
      setTrackQueue([track]);
    }
    
    loadTrack(track);
  }, [loadTrack, trackQueue]);
  
  // Navigation entre les pistes
  const nextTrack = useCallback(() => {
    if (trackQueue.length <= 1) return;
    
    const currentIndex = trackQueue.findIndex(track => track.track_id === currentTrackId);
    
    // Si on ne trouve pas la piste courante ou si c'est la dernière
    if (currentIndex === -1 || currentIndex === trackQueue.length - 1) return;
    
    const nextTrackToPlay = trackQueue[currentIndex + 1];
    loadTrack(nextTrackToPlay);
  }, [trackQueue, currentTrackId, loadTrack]);
  
  const previousTrack = useCallback(() => {
    if (trackQueue.length <= 1) return;
    
    const currentIndex = trackQueue.findIndex(track => track.track_id === currentTrackId);
    
    // Si on ne trouve pas la piste courante ou si c'est la première
    if (currentIndex === -1 || currentIndex === 0) return;
    
    const previousTrackToPlay = trackQueue[currentIndex - 1];
    loadTrack(previousTrackToPlay);
  }, [trackQueue, currentTrackId, loadTrack]);
  
  return {
    // États
    isPlaying,
    currentTrackId,
    currentTrack,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    trackQueue,
    
    // Méthodes
    playTrack,
    loadTrack,
    togglePlay,
    changeVolume,
    seek,
    nextTrack,
    previousTrack,
    
    // Référence audio (optionnelle pour debug)
    audioRef,
  };
}
