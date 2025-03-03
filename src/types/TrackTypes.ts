export interface Track {
  track_id: string;
  user_id: string;
  title: string;
  genre: string;
  bpm?: number;
  file_path?: string;
  cover_image?: string;
  description?: string;
  tags?: string[];
  duration?: number;
  likes?: number;
  downloads?: number;
  plays?: number;
  artist?: string;
  isPremium?: boolean;
  price?: number;
  created_at?: string;
  updated_at?: string;
  mood?: string;
  presigned_url?: string; // Ajout pour l'URL du fichier audio
  isPublic?: boolean;
}

export interface TrackFormData {
  title: string;
  genre: string;
  bpm: number;
  description?: string;
  tags?: string[];
  mood?: string;
  isPublic?: boolean;
  file_path?: string;
  track_id?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrackId: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  trackQueue: string[];
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}