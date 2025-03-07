import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '../types/TrackTypes';
import { incrementPlayCount } from '../api/track';

interface AudioPlayerOptions {
  onEnded?: () => void;
  onError?: (error: any) => void;
  autoplay?: boolean;
}

/**
 * Hook personnalisé pour gérer la lecture audio
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playCountedRef = useRef<boolean>(false); // Pour suivre si l'écoute a été comptée

  // Fonction utilitaire pour vérifier si une erreur est de type AbortError
  const isAbortError = (error: unknown): boolean => {
    return error instanceof Error && error.name === 'AbortError';
  };

  // Initialisation de l'élément audio
  useEffect(() => {
    // Créer l'élément audio s'il n'existe pas
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Configuration des événements audio
      const audioElement = audioRef.current;
      
      audioElement.addEventListener('loadedmetadata', () => {
        setDuration(audioElement.duration || 0);
        setIsLoading(false);
      });
      
      audioElement.addEventListener('canplay', () => {
        if (options.autoplay) {
          // Stocker la promesse de lecture
          playPromiseRef.current = audioElement.play();
          playPromiseRef.current
            .then(() => setIsPlaying(true))
            .catch((playError: unknown) => {
              // Si ce n'est pas une erreur d'interruption, la traiter comme une vraie erreur
              if (!isAbortError(playError)) {
                console.error('Erreur de lecture:', playError);
                setIsPlaying(false);
                setError(`Impossible de lire l'audio: ${playError instanceof Error ? playError.message : 'Erreur inconnue'}`);
              }
            });
        }
      });
      
      audioElement.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (options.onEnded) options.onEnded();
      });
      
      audioElement.addEventListener('error', (e) => {
        console.error('Erreur audio:', e);
        setIsLoading(false);
        setIsPlaying(false);
        setError('Impossible de charger le fichier audio');
        if (options.onError) options.onError(e);
      });
      
      // Définir le volume initial
      audioElement.volume = volume;
    }
    
    // Nettoyage
    return () => {
      const audioElement = audioRef.current;
      if (audioElement) {
        // S'assurer que toute promesse de lecture est résolue avant de nettoyer
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audioElement.pause();
              audioElement.src = '';
            })
            .catch(() => {
              audioElement.src = '';
            });
        } else {
          audioElement.pause();
          audioElement.src = '';
        }
        
        // Supprimer les écouteurs d'événements
        audioElement.removeEventListener('loadedmetadata', () => {});
        audioElement.removeEventListener('canplay', () => {});
        audioElement.removeEventListener('ended', () => {});
        audioElement.removeEventListener('error', () => {});
      }
      
      // Nettoyer l'intervalle de progression
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [options, volume]);
  
  // Gestion de la progression de lecture
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      // Mettre à jour le temps de lecture périodiquement
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else if (progressIntervalRef.current) {
      // Arrêter l'intervalle si pas en lecture
      clearInterval(progressIntervalRef.current);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);
  
  // Comptage des écoutes après 5 secondes de lecture
  useEffect(() => {
    if (isPlaying && currentTrack?.track_id && !playCountedRef.current) {
      // Attendre 5 secondes avant de compter comme une écoute
      const timer = setTimeout(() => {
        incrementPlayCount(currentTrack.track_id)
          .then(() => {
            playCountedRef.current = true;
            console.log('Écoute comptabilisée pour:', currentTrack.track_id);
          })
          .catch(error => {
            console.error('Erreur lors du comptage de l\'écoute:', error);
          });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentTrack]);
  
  // Réinitialiser le compteur d'écoute lorsqu'une nouvelle piste est chargée
  useEffect(() => {
    playCountedRef.current = false;
  }, [currentTrackId]);
  
  // Charger et jouer une piste
  const loadTrack = useCallback(async (track: Track) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier que l'URL présignée existe
      if (!track.presigned_url) {
        throw new Error('Aucune URL de lecture disponible');
      }
      
      // Réinitialiser l'audio
      if (audioRef.current) {
        // S'assurer que toute promesse de lecture précédente est terminée
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (error) {
            // Ignorer l'erreur AbortError qui est normale lors d'une interruption
            if (!isAbortError(error)) {
              console.error('Erreur lors de l\'attente de la promesse précédente:', error);
            }
          }
        }
        
        // Arrêter la lecture actuelle
        audioRef.current.pause();
        audioRef.current.src = '';
        
        // Définir la nouvelle source
        audioRef.current.src = track.presigned_url;
        
        // Précharger l'audio
        audioRef.current.load();
        
        // Tenter de jouer l'audio
        playPromiseRef.current = audioRef.current.play();
        playPromiseRef.current
          .then(() => {
            setIsPlaying(true);
          })
          .catch((playError: unknown) => {
            // Si ce n'est pas une erreur d'interruption, la traiter comme une vraie erreur
            if (!isAbortError(playError)) {
              console.error('Erreur de lecture:', playError);
              setError(`Impossible de lire la piste: ${playError instanceof Error ? playError.message : 'Erreur inconnue'}`);
              setIsPlaying(false);
            }
          });
        
        // Mettre à jour l'état
        setCurrentTrackId(track.track_id);
        setCurrentTrack(track);
        
        // Réinitialiser le compteur d'écoute pour la nouvelle piste
        playCountedRef.current = false;
      }
    } catch (error: unknown) {
      console.error('Erreur lors du chargement de la piste:', error);
      setError(`Erreur lors du chargement de la piste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Basculer lecture/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // S'assurer que toute promesse de lecture est résolue avant de mettre en pause
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          })
          .catch((error) => {
            // Ignorer l'erreur AbortError qui est normale lors d'une interruption
            if (!isAbortError(error)) {
              console.error('Erreur lors de la mise en pause:', error);
            }
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      playPromiseRef.current = audioRef.current.play();
      playPromiseRef.current
        .then(() => setIsPlaying(true))
        .catch((error: unknown) => {
          // Si ce n'est pas une erreur d'interruption, la traiter comme une vraie erreur
          if (!isAbortError(error)) {
            console.error('Erreur de lecture:', error);
            setError(`Impossible de lire la piste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            setIsPlaying(false);
          }
        });
    }
  }, [isPlaying]);
  
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
    if (!audioRef.current) return;
    
    const safeTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, [duration]);
  
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
    
    // Méthodes
    loadTrack,
    togglePlay,
    changeVolume,
    seek,
    
    // Référence audio (optionnelle pour debug)
    audioRef,
  };
}