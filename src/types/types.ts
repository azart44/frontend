export interface UserProfile {
    userId: string;
    username?: string;
    email: string;
    bio?: string;
    userType?: string;
    experienceLevel?: string;
    musicGenres?: string[];
    tags?: string[];
    socialLinks?: {
      instagram?: string;
      // autres réseaux sociaux
    };
    profileImageUrl?: string;
    profileCompleted?: boolean;
    location?: string;
    software?: string;
    musicalMood?: string;
    musicGenre?: string;
    favoriteArtists?: string[];
    updatedAt?: number;
  }
  export interface UserSuggestion {
    userId: string;
    name?: string;
    username?: string; // Ajout optionnel
    profileImage?: string;
    userType?: string;
  }