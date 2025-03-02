export interface UserProfile {
  // Identifiant
  userId: string;
  email: string;

  // Informations de base
  username?: string;
  bio?: string;
  userType?: string;
  experienceLevel?: string;

  // Préférences musicales
  musicGenres?: string[];
  tags?: string[];
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    spotify?: string;
    twitter?: string;
  };

  // Médias et images
  profileImageUrl?: string;     // URL présignée S3
  profileImageBase64?: string;  // Alternative au format base64 (rétrocompatibilité)
  profileCompleted?: boolean;

  // Détails additionnels
  location?: string;
  software?: string;
  musicalMood?: string;
  musicGenre?: string;
  favoriteArtists?: string[];

  // Métadonnées
  updatedAt?: number;
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
  experienceLevel?: string;
  location?: string;
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    spotify?: string;
    twitter?: string;
  };
}