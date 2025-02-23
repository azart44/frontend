import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  View, 
  Heading, 
  Text, 
  Loader, 
  Badge, 
  Flex, 
  Button, 
  Card,
  Image,
} from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FaTwitter, FaInstagram, FaSoundcloud, FaYoutube } from 'react-icons/fa';
import { UserProfile, SocialIconProps } from '../types/ProfileTypes';
import { fetchProfileImage } from '../utils/ProfileUtils';
import EditProfile from './EditProfile';
import AudioPlayer from './AudioPlayer';
import AudioUploader from './AudioUploader';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const isOwnProfile = !userId || (user && userId === user.username);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<UserProfile>('/get-user-profile', {
        params: { userId: userId || user?.username }
      });
      const fetchedProfile = {
        ...response.data,
        audioFiles: response.data.audioFiles || []
      };
      setProfile(fetchedProfile);

      // Merge with localStorage data
      const storedAudioFiles = JSON.parse(localStorage.getItem(`audioFiles_${fetchedProfile.userId}`) || '[]');
      const mergedAudioFiles = Array.from(new Set([...fetchedProfile.audioFiles, ...storedAudioFiles]));
      setProfile(prev => prev ? { ...prev, audioFiles: mergedAudioFiles } : null);

      const imageUrl = await fetchProfileImage(fetchedProfile.userId);
      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Error fetching user profile. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const handleAudioUploadSuccess = (fileUrl: string) => {
    if (profile) {
      const updatedAudioFiles = [...profile.audioFiles, fileUrl];
      setProfile({ ...profile, audioFiles: updatedAudioFiles });
      
      // Update localStorage
      localStorage.setItem(`audioFiles_${profile.userId}`, JSON.stringify(updatedAudioFiles));
    }
  };

  const SocialIcon: React.FC<SocialIconProps> = ({ platform, url }) => {
    const iconMap: { [key: string]: React.ElementType } = {
      twitter: FaTwitter,
      instagram: FaInstagram,
      soundcloud: FaSoundcloud,
      youtube: FaYoutube,
    };
    const IconComponent = iconMap[platform.toLowerCase()];
    return IconComponent ? <IconComponent size={24} onClick={() => window.open(url, '_blank')} style={{ cursor: 'pointer', marginRight: '10px' }} /> : null;
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View padding="2rem" textAlign="center">
        <Heading level={1}>Oops! Something went wrong</Heading>
        <Text>{error}</Text>
        <Button onClick={fetchProfile} marginTop="1rem">Try Again</Button>
      </View>
    );
  }

  if (!profile) {
    return (
      <View padding="2rem" textAlign="center">
        <Heading level={1}>Profile Not Found</Heading>
        <Text>We couldn't find the requested profile.</Text>
      </View>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <EditProfile
        userProfile={profile}
        setUserProfile={setProfile}
        setIsEditing={setIsEditing}
        onProfileUpdate={fetchProfile}
      />
    );
  }

  return (
    <View padding="2rem" backgroundColor="#f0f0f0">
      <Card>
        <Flex direction="column" alignItems="center">
          <Image
            src={profileImageUrl || undefined}
            alt="Profile Picture"
            width="150px"
            height="150px"
            objectFit="cover"
            borderRadius="50%"
          />
          <Heading level={1} marginTop="1rem">{profile.userId}</Heading>
          <Text>{profile.email}</Text>
          <Badge variation="info" marginTop="0.5rem">{profile.userType}</Badge>
          <Badge variation="success">{profile.skillLevel}</Badge>
          
          <Flex marginTop="1rem">
            {profile.socialLinks && Object.entries(profile.socialLinks).map(([platform, url]) => (
              <SocialIcon key={platform} platform={platform} url={url} />
            ))}
          </Flex>

          <Card variation="elevated" marginTop="2rem" width="100%">
            <Heading level={3}>Music Genres</Heading>
            <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
              {profile.musicGenres.map((genre) => (
                <Badge key={genre} variation="info">{genre}</Badge>
              ))}
            </Flex>
          </Card>

          <Card variation="elevated" marginTop="2rem" width="100%">
            <Heading level={3}>Influencing Artists</Heading>
            <Text marginTop="1rem">{profile.influencingArtists.join(', ')}</Text>
          </Card>

          {isOwnProfile && (
            <>
              <Button onClick={() => setIsEditing(true)} marginTop="2rem" variation="primary" isFullWidth>
                Edit Profile
              </Button>
              <AudioUploader 
                userId={profile.userId} 
                onUploadSuccess={handleAudioUploadSuccess} 
              />
            </>
          )}

          <Card variation="elevated" marginTop="2rem" width="100%">
            <Heading level={3}>Audio Files</Heading>
            {profile.audioFiles && profile.audioFiles.length > 0 ? (
              profile.audioFiles.map((fileUrl, index) => (
                <AudioPlayer 
                  key={index} 
                  src={fileUrl} 
                  name={`Track ${index + 1}`} 
                />
              ))
            ) : (
              <Text>No audio files uploaded yet.</Text>
            )}
          </Card>
        </Flex>
      </Card>
    </View>
  );
};

export default Profile;