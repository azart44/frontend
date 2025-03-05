import { Track } from './TrackTypes';

export interface Playlist {
  playlist_id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  created_at: number;
  updated_at: number;
  track_count: number;
  track_ids: string[];
  track_positions?: Record<string, number>;
  tracks?: Track[];
}

export interface PlaylistFormData {
  playlist_id?: string;
  title: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  tracks?: {
    track_id: string;
    position?: number;
  }[];
}

export interface PlaylistsResponse {
  playlists: Playlist[];
  count: number;
}

export interface PlaylistResponse {
  message: string;
  playlist: Playlist;
}

export interface DeletePlaylistResponse {
  message: string;
}