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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playCountedRef = useRef<boolean>(false);
  const retryAttemptsRef = useRef<number>(0);
  const maxRetryAttempts = 3;

  // Initialisation de l'élément audio
  useEffect(() => {
    // Créer l'élément audio s'il n'existe pas
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Configuration des événements audio
      const audioElement = audioRef.current;
      
      // Configuration essentielle pour S3
      audioElement.crossOrigin = "anonymous";
      audioElement.preload = "auto";
      
      audioElement.addEventListener('loadedmetadata', () => {
        console.log('Métadonnées audio chargées, durée:', audioElement.duration);
        setDuration(audioElement.duration || 0);
        setIsLoading(false);
      });
      
      audioElement.addEventListener('canplay', () => {
        console.log('Audio prêt à être joué');
        setIsLoading(false);
        
        // Réinitialiser le compteur de tentatives puisque ça fonctionne
        retryAttemptsRef.current = 0;
        
        if (options.autoplay) {
          try {
            playPromiseRef.current = audioElement.play();
            playPromiseRef.current
              .then(() => {
                console.log('Lecture automatique réussie');
                setIsPlaying(true);
              })
              .catch((playError) => {
                console.error('Erreur de lecture automatique:', playError);
                setIsPlaying(false);
              });
          } catch (e) {
            console.error('Exception lors de la lecture automatique:', e);
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
        const errorCode = audioElement.error ? audioElement.error.code : 'unknown';
        const errorMessage = audioElement.error ? audioElement.error.message : 'Unknown error';
        
        console.error(`Erreur audio (${errorCode}): ${errorMessage}`);
        setIsLoading(false);
        
        // Implémenter une logique de nouvelle tentative
        if (retryAttemptsRef.current < maxRetryAttempts && currentTrack) {
          console.log(`Tentative de lecture #${retryAttemptsRef.current + 1}/${maxRetryAttempts}`);
          retryAttemptsRef.current++;
          
          // Attendre un court instant avant de réessayer
          setTimeout(() => {
            console.log("Réessai de la lecture après erreur");
            const source = currentTrack.presigned_url;
            if (source) {
              audioElement.src = source;
              audioElement.load();
              audioElement.play().catch(err => {
                console.error("Échec de la nouvelle tentative:", err);
                if (retryAttemptsRef.current >= maxRetryAttempts) {
                  setError(`Impossible de lire le fichier audio après ${maxRetryAttempts} tentatives.`);
                  setIsPlaying(false);
                  if (options.onError) options.onError(e);
                }
              });
            }
          }, 1000);
        } else {
          setError(`Impossible de lire le fichier audio (${errorMessage})`);
          setIsPlaying(false);
          if (options.onError) options.onError(e);
        }
      });
      
      // Définir le volume initial
      audioElement.volume = volume;
    }
    
    // Nettoyage
    return () => {
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement.load();
        
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
    retryAttemptsRef.current = 0;
  }, [currentTrackId]);
  
  // Fonction pour configurer une nouvelle piste
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
  
  // Basculer lecture/pause
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
  
  // Fonction pour jouer une piste directement
  const playTrack = useCallback((track: Track) => {
    console.log('Demande de lecture directe:', track.title);
    loadTrack(track);
  }, [loadTrack]);
  
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
    playTrack,
    loadTrack,
    togglePlay,
    changeVolume,
    seek,
    
    // Référence audio (optionnelle pour debug)
    audioRef,
  };
}