export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  userType: string;
  experienceLevel: string;
  bio: string;
  tags?: string[];
  inspirations: string[];
  musicGenres: string[];
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
  };
  profileImageBase64?: string;
  profileImageUrl?: string;
}

export interface SocialIconProps {
  platform: string;
  url: string;
}
