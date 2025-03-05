/**
 * Utilitaires pour la gestion des playlists
 */

/**
 * Calcule la durée totale d'une playlist en secondes
 * @param tracks Liste des pistes avec leur durée
 * @returns Durée totale en secondes
 */
export const calculatePlaylistDuration = (tracks: Array<{duration?: number}> = []): number => {
    return tracks.reduce((total, track) => {
      return total + (track.duration || 0);
    }, 0);
  };
  
  /**
   * Formate une durée en secondes en format mm:ss ou hh:mm:ss
   * @param durationSeconds Durée en secondes
   * @returns Chaîne formatée
   */
  export const formatDuration = (durationSeconds: number): string => {
    if (!durationSeconds || durationSeconds <= 0) {
      return '0:00';
    }
    
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = Math.floor(durationSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  /**
   * Génère une URL d'image de couverture pour une playlist sans couverture
   * Utilise les couleurs des genres musicaux dominants
   * @param tracks Liste des pistes de la playlist
   * @returns URL d'image de couverture générée
   */
  export const generateCoverImageUrl = (tracks: Array<{genre?: string}> = []): string => {
    // Par défaut, retourne un dégradé bleu/vert
    if (!tracks.length) {
      return 'linear-gradient(135deg, #3e1dfc, #87e54c)';
    }
    
    // Compter les genres
    const genreCounts: Record<string, number> = {};
    tracks.forEach(track => {
      const genre = track.genre || 'unknown';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    
    // Trier les genres par nombre d'occurrences
    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);
    
    // Associer des couleurs aux genres les plus courants
    const genreColors: Record<string, string> = {
      'Hip Hop': '#ffcc00',
      'Trap': '#ff6b6b',
      'Boom Bap': '#8a2be2',
      'RnB': '#ff7eb9',
      'Drill': '#000000',
      'Electronic': '#00ffcc',
      'Pop': '#ff9999',
      'Rock': '#cc0000',
      'unknown': '#808080'
    };
    
    // Prendre les deux genres les plus courants pour le dégradé
    const color1 = genreColors[sortedGenres[0]] || '#3e1dfc';
    const color2 = sortedGenres.length > 1 
      ? (genreColors[sortedGenres[1]] || '#87e54c') 
      : '#87e54c';
    
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };
  
  /**
   * Vérifie si une piste est déjà dans une playlist
   * @param playlistTrackIds Liste des IDs de pistes dans la playlist
   * @param trackId ID de la piste à vérifier
   * @returns true si la piste est dans la playlist, false sinon
   */
  export const isTrackInPlaylist = (
    playlistTrackIds: string[] = [], 
    trackId: string
  ): boolean => {
    return playlistTrackIds.includes(trackId);
  };