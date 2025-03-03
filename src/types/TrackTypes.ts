export interface Track {
  track_id: string;
  user_id: string;
  title: string;
  genre: string;
  bpm?: number;
  file_path?: string;
  presigned_url?: string; // URL présignée pour la lecture
  cover_image?: string;
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
}

export interface TrackUploadResponse {
  trackId: string;
  uploadUrl: string;
}

export interface TrackUpdateResponse {
  message: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrackId: string | null;
  duration: number;
  currentTime: number;
  volume: number;
  trackQueue: string[];
}