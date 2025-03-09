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

  // Ajout de logs améliorés pour suivre les erreurs
  const logAudioError = (audio: HTMLAudioElement) => {
    if (!audio) return;
    
    const errorCodes = [
      'MEDIA_ERR_ABORTED',
      'MEDIA_ERR_NETWORK',
      'MEDIA_ERR_DECODE',
      'MEDIA_ERR_SRC_NOT_SUPPORTED'
    ];
    
    const error = audio.error;
    if (error) {
      console.error('Erreur audio:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', errorCodes[error.code - 1] || 'UNKNOWN_ERROR');
      
      if (error.message) {
        console.error('Message d\'erreur supplémentaire:', error.message);
      }
    }
  };

  // Initialisation de l'élément audio
  useEffect(() => {
    // Créer l'élément audio s'il n'existe pas
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Configuration des événements audio
      const audioElement = audioRef.current;
      
      audioElement.addEventListener('loadedmetadata', () => {
        console.log('Métadonnées audio chargées, durée:', audioElement.duration);
        setDuration(audioElement.duration || 0);
        setIsLoading(false);
      });
      
      audioElement.addEventListener('canplay', () => {
        console.log('Audio prêt à être joué, autoplay:', options.autoplay);
        if (options.autoplay) {
          console.log('Tentative de lecture automatique...');
          // Stocker la promesse de lecture
          try {
            playPromiseRef.current = audioElement.play();
            playPromiseRef.current
              .then(() => {
                console.log('Lecture automatique réussie');
                setIsPlaying(true);
              })
              .catch((playError: unknown) => {
                // Si ce n'est pas une erreur d'interruption, la traiter comme une vraie erreur
                if (!isAbortError(playError)) {
                  console.error('Erreur de lecture automatique:', playError);
                  setIsPlaying(false);
                  setError(`Impossible de lire l'audio: ${playError instanceof Error ? playError.message : 'Erreur inconnue'}`);
                }
              });
          } catch (e) {
            console.error('Exception lors de la tentative de lecture automatique:', e);
          }
        }
      });
      
      audioElement.addEventListener('ended', () => {
        console.log('Lecture terminée');
        setIsPlaying(false);
        setCurrentTime(0);
        if (options.onEnded) options.onEnded();
      });
      
      audioElement.addEventListener('error', (e) => {
        console.error('Erreur audio:', e);
        logAudioError(audioElement);
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
        console.log('Nettoyage de l\'élément audio');
        // S'assurer que toute promesse de lecture est résolue avant de nettoyer
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audioElement.pause();
              audioElement.src = '';
              audioElement.load(); // Force la réinitialisation de l'élément audio
            })
            .catch(() => {
              audioElement.src = '';
              audioElement.load(); // Force la réinitialisation de l'élément audio
            });
        } else {
          audioElement.pause();
          audioElement.src = '';
          audioElement.load(); // Force la réinitialisation de l'élément audio
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
      console.log('Chargement de la piste:', track.title);
      console.log('URL présignée reçue:', track.presigned_url);
      setIsLoading(true);
      setError(null);
      
      // Vérifier que l'URL présignée existe
      if (!track.presigned_url) {
        console.error('Erreur: URL présignée manquante');
        throw new Error('Aucune URL de lecture disponible');
      }
      
      // Créer un nouvel élément audio à chaque fois
      // Cette approche évite beaucoup de problèmes de réutilisation
      const newAudio = new Audio();
      
      // Configurer les événements sur le nouvel élément
      newAudio.addEventListener('loadedmetadata', () => {
        console.log('Métadonnées chargées pour la nouvelle piste, durée:', newAudio.duration);
        setDuration(newAudio.duration || 0);
        setIsLoading(false);
      });
      
      newAudio.addEventListener('canplay', () => {
        console.log('Nouvel audio prêt à être joué');
        try {
          playPromiseRef.current = newAudio.play();
          playPromiseRef.current
            .then(() => {
              console.log('Lecture démarrée avec succès');
              setIsPlaying(true);
            })
            .catch((playError) => {
              console.error('Erreur de lecture après canplay:', playError);
              setIsPlaying(false);
              setError(`Impossible de lire la piste: ${playError instanceof Error ? playError.message : 'Erreur inconnue'}`);
            });
        } catch (e) {
          console.error('Exception lors de la tentative de lecture:', e);
          setIsPlaying(false);
        }
      });
      
      newAudio.addEventListener('ended', () => {
        console.log('Lecture terminée');
        setIsPlaying(false);
        setCurrentTime(0);
        if (options.onEnded) options.onEnded();
      });
      
      newAudio.addEventListener('error', (e) => {
        console.error('Erreur audio sur le nouvel élément:', e);
        logAudioError(newAudio);
        setIsLoading(false);
        setIsPlaying(false);
        setError('Impossible de charger le fichier audio');
        if (options.onError) options.onError(e);
      });
      
      // Définir le volume
      newAudio.volume = volume;
      
      // Arrêter l'élément audio précédent s'il existe
      if (audioRef.current) {
        try {
          const oldAudio = audioRef.current;
          oldAudio.pause();
          oldAudio.src = '';
          
          // Nettoyer les écouteurs d'événements
          oldAudio.onloadedmetadata = null;
          oldAudio.oncanplay = null;
          oldAudio.onended = null;
          oldAudio.onerror = null;
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage de l\'ancien audio:', cleanupError);
        }
      }
      
      // Affecter le nouvel élément audio
      audioRef.current = newAudio;
      
      // Définir la source et lancer le chargement
      console.log('Définition de la source sur le nouvel audio:', track.presigned_url);
      newAudio.src = track.presigned_url;
      newAudio.load();
      
      // Mettre à jour l'état
      setCurrentTrackId(track.track_id);
      setCurrentTrack(track);
      
      // Réinitialiser le compteur d'écoute pour la nouvelle piste
      playCountedRef.current = false;
    } catch (error: unknown) {
      console.error('Erreur lors du chargement de la piste:', error);
      setError(`Erreur lors du chargement de la piste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [volume, options]);
  
  // Basculer lecture/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      console.error('Élément audio non initialisé (togglePlay)');
      return;
    }
    
    console.log('Toggle play appelé, état actuel:', isPlaying);
    
    try {
      if (isPlaying) {
        // S'assurer que toute promesse de lecture est résolue avant de mettre en pause
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              if (audioRef.current) {
                console.log('Mise en pause');
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
          console.log('Mise en pause (pas de promesse en cours)');
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        console.log('Tentative de lecture...');
        if (!audioRef.current.src) {
          console.error('Pas de source définie pour la lecture');
          setError('Pas de piste à lire');
          return;
        }
        
        playPromiseRef.current = audioRef.current.play();
        playPromiseRef.current
          .then(() => {
            console.log('Lecture démarrée');
            setIsPlaying(true);
          })
          .catch((error: unknown) => {
            // Si ce n'est pas une erreur d'interruption, la traiter comme une vraie erreur
            if (!isAbortError(error)) {
              console.error('Erreur de lecture:', error);
              setError(`Impossible de lire la piste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
              setIsPlaying(false);
            }
          });
      }
    } catch (e) {
      console.error('Exception dans togglePlay:', e);
      setError(`Erreur de lecture/pause: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
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
    if (!audioRef.current) {
      console.error('Élément audio non initialisé (seek)');
      return;
    }
    
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