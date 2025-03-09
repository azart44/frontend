import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Track } from '../types/TrackTypes';
import { getTrackById } from '../api/track';

// Interface du contexte
interface AudioContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  changeVolume: (volume: number) => void;
  isLoading: boolean;
  error: string | null;
}

// Création du contexte
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Props pour le provider
interface AudioProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [trackQueue, setTrackQueue] = useState<Track[]>([]);
  
  // Utilisation du hook audio
  const {
    isPlaying,
    currentTrack,
    duration,
    currentTime,
    volume,
    loadTrack,
    togglePlay,
    seek,
    changeVolume,
    isLoading,
    error
  } = useAudioPlayer({
    onEnded: () => {
      // Logique de lecture de la piste suivante dans la file d'attente
      console.log('Track ended, checking queue...');
      // À implémenter plus tard
    },
    autoplay: true // Activer la lecture automatique lors du chargement d'une piste
  });
  
  // Fonction pour jouer une piste
  const playTrack = useCallback((track: Track) => {
    console.log('Tentative de lecture de la piste:', track.title);
    
    // Si la piste n'a pas d'URL présignée mais a un file_path, c'est peut-être
    // qu'il faut aller la chercher manuellement
    if (!track.presigned_url && track.track_id) {
      console.log('Pas d\'URL présignée mais track_id disponible, tentative de récupération...');
      // Récupérer les détails de la piste pour obtenir l'URL présignée
      getTrackById(track.track_id)
        .then(response => {
          console.log('Piste récupérée avec URL présignée:', response.data);
          if (response.data.presigned_url) {
            // Mettre à jour la piste avec l'URL présignée et jouer
            const updatedTrack = {
              ...track,
              presigned_url: response.data.presigned_url
            };
            console.log('URL présignée récupérée:', updatedTrack.presigned_url);
            loadTrack(updatedTrack);
          } else {
            console.error('Impossible de récupérer l\'URL présignée');
          }
        })
        .catch(error => {
          console.error('Erreur lors de la récupération de la piste:', error);
        });
      return;
    }
    
    // Vérifier que nous avons bien une URL présignée
    if (!track.presigned_url) {
      console.error('Erreur: Pas d\'URL présignée disponible pour cette piste');
      return;
    }
    
    console.log('URL présignée disponible, lecture directe:', track.presigned_url);
    // Charger et jouer la piste
    loadTrack(track);
  }, [loadTrack]);
  
  // Valeur du contexte
  const contextValue: AudioContextType = {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    playTrack,
    togglePlay,
    seek,
    changeVolume,
    isLoading,
    error
  };
  
  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// Hook pour utiliser le contexte audio
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};