export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  userType: string;
  experienceLevel: string;
  bio: string;
  tags?: string[];
  inspirations?: string[];
  musicGenres: string[];
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
    spotify?: string;
    twitter?: string;
  };
  profileImageBase64?: string;
  profileImageUrl?: string;
  isVerified?: boolean;
  availability?: 'available' | 'busy' | 'offline';
  location?: string;
  badges?: UserBadge[];
  followers?: number;
  following?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'engagement' | 'performance' | 'artist' | 'producer' | 'reputation';
  dateAwarded: string;
}

export interface SocialIconProps {
  platform: string;
  url: string;
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