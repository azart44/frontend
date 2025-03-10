import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '../types/TrackTypes';
import { incrementPlayCount } from '../api/track';

/**
 * Hook personnalisé pour gérer la lecture audio
 * Version améliorée avec gestion complète de la progression, volume et file d'attente
 */
export function useAudioPlayer() {
  // États du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8); // 80% par défaut
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackQueue, setTrackQueue] = useState<Track[]>([]);
  
  // Références
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  
  // Référence pour contrôler si le compteur d'écoute a été incrémenté
  const playCountedRef = useRef<boolean>(false);
  
  // Initialiser l'élément audio si nécessaire
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    
    // Gérer la fin de la piste
    const handleEnded = () => {
      if (trackQueue.length > 1) {
        // Trouver la piste suivante dans la file d'attente
        const currentIndex = trackQueue.findIndex(track => track.track_id === currentTrackId);
        if (currentIndex !== -1 && currentIndex < trackQueue.length - 1) {
          const nextTrack = trackQueue[currentIndex + 1];
          playTrackInternal(nextTrack);
        }
      } else {
        // Pas de piste suivante, arrêter la lecture
        setIsPlaying(false);
      }
    };
    
    // Configurer les écouteurs d'événements
    const setupEventListeners = () => {
      if (audioRef.current) {
        // Événement de mise à jour du temps
        audioRef.current.addEventListener('timeupdate', updateProgress);
        
        // Événement de fin de piste
        audioRef.current.addEventListener('ended', handleEnded);
        
        // Événement de chargement des métadonnées
        audioRef.current.addEventListener('loadedmetadata', () => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsLoading(false);
          }
        });
        
        // Événement de chargement en cours
        audioRef.current.addEventListener('loadstart', () => {
          setIsLoading(true);
        });
        
        // Événement de début de lecture
        audioRef.current.addEventListener('playing', () => {
          setIsPlaying(true);
          setIsLoading(false);
          startProgressTracking();
        });
        
        // Événement de pause
        audioRef.current.addEventListener('pause', () => {
          setIsPlaying(false);
          stopProgressTracking();
        });
        
        // Événement d'erreur
        audioRef.current.addEventListener('error', (e) => {
          const errorMessage = 'Erreur de lecture audio';
          console.error(errorMessage, e);
          setError(errorMessage);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    };
    
    setupEventListeners();
    
    // Nettoyer les écouteurs d'événements
    return () => {
      stopProgressTracking();
      
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('loadstart', () => {});
        audioRef.current.removeEventListener('playing', () => {});
        audioRef.current.removeEventListener('pause', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
    };
  }, [currentTrackId, trackQueue, volume]);
  
  // Mettre à jour la progression de la lecture
  const updateProgress = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      
      // Incrémenter le compteur d'écoute une fois que l'utilisateur a écouté au moins 10 secondes
      if (time > 10 && !playCountedRef.current && currentTrackId) {
        playCountedRef.current = true;
        incrementPlayCount(currentTrackId).catch(console.error);
      }
    }
  };
  
  // Démarrer le suivi de la progression
  const startProgressTracking = () => {
    stopProgressTracking(); // Arrêter tout intervalle existant
    
    // Mettre à jour la progression régulièrement
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100); // Actualiser toutes les 100ms
  };
  
  // Arrêter le suivi de la progression
  const stopProgressTracking = () => {
    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  // Fonction interne pour lire une piste
  const playTrackInternal = useCallback((track: Track) => {
    if (!audioRef.current) return;
    
    try {
      // Réinitialiser le statut de comptage
      playCountedRef.current = false;
      
      // Mettre à jour les états
      setCurrentTrackId(track.track_id);
      setCurrentTrack(track);
      setIsLoading(true);
      setError(null);
      
      // Charger l'URL
      audioRef.current.src = track.presigned_url || '';
      audioRef.current.load();
      
      // Démarrer la lecture
      playPromiseRef.current = audioRef.current.play();
      playPromiseRef.current
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          // Si l'erreur est liée à l'autoplay, ce n'est pas une erreur fatale
          if (error.name === 'NotAllowedError') {
            setIsPlaying(false);
            setIsLoading(false);
          } else {
            console.error('Erreur de lecture:', error);
            setError(`Erreur de lecture: ${error.message}`);
            setIsPlaying(false);
            setIsLoading(false);
          }
        });
    } catch (error: any) {
      console.error('Exception lors de la lecture:', error);
      setError(`Erreur: ${error.message}`);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);
  
  // Fonction publique pour lire une piste
  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    // Mettre à jour la file d'attente si fournie
    if (queue) {
      setTrackQueue(queue);
    } else if (track) {
      // Créer une file d'attente avec la piste actuelle
      setTrackQueue([track]);
    }
    
    playTrackInternal(track);
  }, [playTrackInternal]);
  
  // Basculer entre lecture et pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      playPromiseRef.current = audioRef.current.play();
      playPromiseRef.current?.catch((error) => {
        console.error('Erreur lors de la reprise de la lecture:', error);
        setError(`Erreur: ${error.message}`);
      });
    }
  }, [isPlaying, currentTrack]);
  
  // Chercher une position spécifique
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    try {
      // S'assurer que le temps est dans les limites valides
      const safeTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
      audioRef.current.currentTime = safeTime;
      setCurrentTime(safeTime);
    } catch (error: any) {
      console.error('Erreur lors du seek:', error);
      setError(`Erreur: ${error.message}`);
    }
  }, []);
  
  // Changer le volume
  const changeVolume = useCallback((newVolume: number) => {
    // S'assurer que le volume est entre 0 et 1
    const safeVolume = Math.max(0, Math.min(1, newVolume));
    
    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
    
    setVolume(safeVolume);
  }, []);
  
  // Passer à la piste suivante
  const nextTrack = useCallback(() => {
    if (trackQueue.length <= 1 || !currentTrackId) return;
    
    const currentIndex = trackQueue.findIndex(track => track.track_id === currentTrackId);
    if (currentIndex === -1 || currentIndex >= trackQueue.length - 1) return;
    
    playTrackInternal(trackQueue[currentIndex + 1]);
  }, [trackQueue, currentTrackId, playTrackInternal]);
  
  // Passer à la piste précédente
  const previousTrack = useCallback(() => {
    if (trackQueue.length <= 1 || !currentTrackId) return;
    
    // Si on est au début de la piste en cours, revenir à la piste précédente
    // Sinon, revenir au début de la piste en cours
    const currentIndex = trackQueue.findIndex(track => track.track_id === currentTrackId);
    
    if (currentIndex === -1) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // Si on a écouté plus de 3 secondes, revenir au début de la piste
      seek(0);
    } else if (currentIndex > 0) {
      // Sinon, aller à la piste précédente
      playTrackInternal(trackQueue[currentIndex - 1]);
    }
  }, [trackQueue, currentTrackId, playTrackInternal, seek]);
  
  // Ajouter une piste à la file d'attente
  const addToQueue = useCallback((track: Track) => {
    setTrackQueue(prev => [...prev, track]);
  }, []);
  
  // Vider la file d'attente
  const clearQueue = useCallback(() => {
    setTrackQueue(currentTrack ? [currentTrack] : []);
  }, [currentTrack]);
  
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
    togglePlay,
    seek,
    changeVolume,
    nextTrack,
    previousTrack,
    addToQueue,
    clearQueue
  };
}