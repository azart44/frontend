export interface UserProfile {
    userId: string;
    email: string;
    userType: string;
    skillLevel: string;
    musicGenres: string[];
    influencingArtists: string[];
    socialLinks?: {
      [key: string]: string;
    };
    audioFiles: string[]; // Initialiser comme un tableau vide par défaut
    profileCompleted: boolean;
  }
  
  export interface SocialIconProps {
    platform: string;
    url: string;
  }