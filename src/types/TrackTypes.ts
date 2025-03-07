export interface Track {
  track_id: string;
  user_id: string;
  title: string;
  genre: string;
  bpm?: number;
  file_path?: string;
  presigned_url?: string; // URL présignée pour la lecture
  cover_image?: string;    // URL présignée de l'image de couverture
  cover_image_path?: string; // Chemin S3 de l'image de couverture
  coverImageUrl?: string;  // Champ alternatif pour la compatibilité
  description?: string;
  tags?: string[];
  duration?: number;
  likes?: number;
  downloads?: number;
  plays?: number;
  artist?: string;
  isPremium?: boolean;
  isPrivate?: boolean;
  price?: number;
  created_at?: string | number;
  updated_at?: string | number;
  mood?: string;
  isLiked?: boolean; // Indique si l'utilisateur courant a liké cette piste
  position?: number; // Position dans une playlist ou un ordre de tri
}

export interface TrackFormData {
  title: string;
  genre: string;
  bpm: number;
  fileName: string;
  fileType: string;
  description?: string;
  tags?: string[];
  mood?: string;
  isPrivate?: boolean;
  coverImageBase64?: string | null;  // Image de couverture en base64 (peut être null)
  coverImageType?: string | null;    // Type MIME de l'image de couverture (peut être null)
}

export interface TrackUploadResponse {
  trackId: string;
  uploadUrl: string;
  hasCoverImage?: boolean;  // Indique si une image a été uploadée
}

export interface TrackUpdateResponse {
  message: string;
  coverImageUpdated?: boolean;  // Indique si l'image a été mise à jour
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrackId: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  trackQueue: string[];
}

export interface TracksResponse {
  tracks: Track[];
  count: number;
}