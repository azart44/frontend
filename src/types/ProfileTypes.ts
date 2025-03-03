export interface UserProfile {
  // Identifiants
  userId: string;
  email: string;

  // Informations de base
  username?: string;
  bio?: string;
  userType?: string;
  experienceLevel?: string;
  location?: string;

  // Préférences musicales
  musicGenres?: string[];
  musicGenre?: string; // Compatibilité avec l'ancien format
  musicalMood?: string;
  tags?: string[];
  favoriteArtists?: string[];

  // Équipement et logiciels
  software?: string;
  equipment?: string[];

  // Médias et images
  profileImageUrl?: string;     // URL présignée S3
  profileImageBase64?: string;  // Pour l'upload d'image
  bannerImageUrl?: string;      // URL pour la bannière du profil
  
  // Réseaux sociaux
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    twitter?: string;
    spotify?: string;
    tiktok?: string;
    [key: string]: string | undefined;
  };

  // Indicateurs d'état
  profileCompleted?: boolean;
  statusIndicator?: 'available' | 'busy' | 'lookingForProject' | 'offline';

  // Métadonnées
  createdAt?: number;
  updatedAt?: number;
  
  // Badges et reconnaissance
  badges?: UserBadge[];
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'engagement' | 'performance' | 'artist' | 'producer' | 'reputation';
  dateAwarded: string;
}

export interface ProfileEditFormData {
  bio?: string;
  tags?: string[];
  musicGenres?: string[];
  musicalMood?: string;
  experienceLevel?: string;
  location?: string;
  software?: string;
  equipment?: string[];
  favoriteArtists?: string[];
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    twitter?: string;
    spotify?: string;
    tiktok?: string;
  };
}

export interface UserSuggestion {
  userId: string;
  name?: string;
  username?: string;
  profileImageUrl?: string;
  userType?: string;
  tags?: string[];
  musicGenres?: string[];
}

export interface ProfileSearchParams {
  userType?: string;
  genre?: string;
  experienceLevel?: string;
  tag?: string;
  location?: string;
}