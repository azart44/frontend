import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  View, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Button, 
  Card,
  Image,
  Loader
} from '@aws-amplify/ui-react';
import { FaInstagram, FaSoundcloud } from 'react-icons/fa';
import { useQueryClient } from '@tanstack/react-query';

import { useUserProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types/ProfileTypes';
import EditProfile from './EditProfile';
import TrackList from './TrackList';
import logo from '../assets/images/logo.png';

// Optimized Image Component
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  fallback = logo, 
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src as string || fallback);

  useEffect(() => {
    const img: HTMLImageElement = document.createElement('img');
    
    img.src = typeof src === 'string' ? src : fallback;
    
    img.onload = () => {
      setImageSrc(typeof src === 'string' ? src : fallback);
    };
    
    img.onerror = () => {
      setImageSrc(fallback);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  return (
    <Image 
      src={imageSrc}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};

const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);

  // Use custom hook for profile fetching
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch 
  } = useUserProfile(userId);

  // Determine if this is the user's own profile
  const isOwnProfile = useMemo(() => {
    return !userId; // If no userId in URL, it's own profile
  }, [userId]);

  // Memoize profile image selection
  const profileImage = useMemo(() => {
    if (!profile) return logo;
    
    // Type assert profile to UserProfile
    const userProfile = profile as UserProfile;
    
    return userProfile.profileImageBase64 
      ? (userProfile.profileImageBase64.startsWith('data:') 
          ? userProfile.profileImageBase64 
          : `data:image/jpeg;base64,${userProfile.profileImageBase64}`)
      : logo;
  }, [profile]);

  // Function to handle profile update
  const handleProfileUpdate = async () => {
    // Invalidate and refetch profile query
    await queryClient.invalidateQueries({ 
      queryKey: userId ? ['userProfile', userId] : ['userProfile'] 
    });
    
    // Trigger manual refetch
    await refetch();
  };

  // Loading and error states
  if (isLoading) return <Loader />;
  if (error) return <View padding="2rem"><Text color="red">Error loading profile</Text></View>;
  if (!profile) return <View padding="2rem"><Text>Profile not found</Text></View>;

  // Type assert profile
  const userProfile = profile as UserProfile;

  // Edit mode for own profile
  if (isEditing && isOwnProfile) {
    return (
      <EditProfile
        userProfile={userProfile}
        setUserProfile={() => {}} // No-op for now
        setIsEditing={setIsEditing}
        onProfileUpdate={handleProfileUpdate} // Add refresh function
      />
    );
  }

  return (
    <View padding="2rem" backgroundColor="#f0f0f0">
      <Card>
        <Flex direction="column" alignItems="center">
          <OptimizedImage
            src={profileImage}
            alt="Profile Picture"
            width="150px"
            height="150px"
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
          
          <Heading level={1} marginTop="1rem">{userProfile.username}</Heading>
          <Text>{userProfile.email}</Text>
          
          <Flex marginTop="0.5rem" gap="0.5rem">
            <Badge variation="info">{userProfile.userType}</Badge>
            <Badge variation="success">{userProfile.experienceLevel}</Badge>
          </Flex>
          
          {/* Social Links */}
          <Flex marginTop="1rem">
            {userProfile.socialLinks?.instagram && (
              <FaInstagram 
                size={24} 
                onClick={() => window.open(userProfile.socialLinks?.instagram, '_blank')} 
                style={{ cursor: 'pointer', marginRight: '10px' }} 
              />
            )}
            {userProfile.socialLinks?.soundcloud && (
              <FaSoundcloud 
                size={24} 
                onClick={() => window.open(userProfile.socialLinks?.soundcloud, '_blank')} 
                style={{ cursor: 'pointer', marginRight: '10px' }} 
              />
            )}
          </Flex>

          {/* Conditional Rendering with Memoization */}
          {userProfile.bio && (
            <Card variation="elevated" marginTop="2rem" width="100%">
              <Heading level={3}>Bio</Heading>
              <Text marginTop="1rem">{userProfile.bio}</Text>
            </Card>
          )}

          {userProfile.musicGenres && userProfile.musicGenres.length > 0 && (
            <Card variation="elevated" marginTop="2rem" width="100%">
              <Heading level={3}>Music Genres</Heading>
              <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
                {userProfile.musicGenres.map((genre: string) => (
                  <Badge key={genre} variation="info">{genre}</Badge>
                ))}
              </Flex>
            </Card>
          )}

          {userProfile.tags && userProfile.tags.length > 0 && (
            <Card variation="elevated" marginTop="2rem" width="100%">
              <Heading level={3}>Tags</Heading>
              <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
                {userProfile.tags.map((tag: string) => (
                  <Badge key={tag} variation="info">{tag}</Badge>
                ))}
              </Flex>
            </Card>
          )}

          {isOwnProfile && (
            <Flex direction="column" gap="1rem" marginTop="2rem" width="100%">
              <Button 
                onClick={() => setIsEditing(true)} 
                variation="primary" 
                isFullWidth
              >
                Edit Profile
              </Button>
              <Button 
                onClick={() => navigate('/add-track')} 
                variation="primary" 
                isFullWidth
              >
                Add Track
              </Button>
            </Flex>
          )}
        </Flex>
      </Card>

      <Card variation="elevated" marginTop="2rem">
        <Heading level={2}>Tracks</Heading>
        <TrackList userId={userProfile.userId} />
      </Card>
    </View>
  );
};

export default React.memo(Profile);