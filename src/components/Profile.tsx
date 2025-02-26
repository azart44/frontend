import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FaInstagram, FaSoundcloud } from 'react-icons/fa';
import { UserProfile } from '../types/ProfileTypes';
import EditProfile from './EditProfile';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = !userId || (user && userId === user.username);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<UserProfile>('/get-user-profile', {
        params: { userId: userId || user?.username }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  if (isLoading) return <Loader />;
  if (error) return <View padding="2rem"><Text>{error}</Text></View>;
  if (!profile) return <View padding="2rem"><Text>Profile not found</Text></View>;

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
            src={profile.profileImageBase64}
            alt="Profile Picture"
            width="150px"
            height="150px"
            objectFit="cover"
            borderRadius="50%"
          />
          <Heading level={1} marginTop="1rem">{profile.username}</Heading>
          <Text>{profile.email}</Text>
          <Badge variation="info" marginTop="0.5rem">{profile.userType}</Badge>
          <Badge variation="success">{profile.experienceLevel}</Badge>
          
          <Flex marginTop="1rem">
            {profile.socialLinks?.instagram && (
              <FaInstagram 
                size={24} 
                onClick={() => window.open(profile.socialLinks?.instagram, '_blank')} 
                style={{ cursor: 'pointer', marginRight: '10px' }} 
              />
            )}
            {profile.socialLinks?.soundcloud && (
              <FaSoundcloud 
                size={24} 
                onClick={() => window.open(profile.socialLinks?.soundcloud, '_blank')} 
                style={{ cursor: 'pointer', marginRight: '10px' }} 
              />
            )}
          </Flex>

          {profile.bio && (
            <Card variation="elevated" marginTop="2rem" width="100%">
              <Heading level={3}>Bio</Heading>
              <Text marginTop="1rem">{profile.bio}</Text>
            </Card>
          )}

          {profile.musicGenres && profile.musicGenres.length > 0 && (
            <Card variation="elevated" marginTop="2rem" width="100%">
              <Heading level={3}>Music Genres</Heading>
              <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
                {profile.musicGenres.map((genre) => (
                  <Badge key={genre} variation="info">{genre}</Badge>
                ))}
              </Flex>
            </Card>
          )}

          {profile.tags && profile.tags.length > 0 && (
            <Card variation="elevated" marginTop="2rem" width="100%">
              <Heading level={3}>Tags</Heading>
              <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
                {profile.tags.map((tag) => (
                  <Badge key={tag} variation="info">{tag}</Badge>
                ))}
              </Flex>
            </Card>
          )}

          {isOwnProfile && (
            <Button onClick={() => setIsEditing(true)} marginTop="2rem" variation="primary" isFullWidth>
              Edit Profile
            </Button>
          )}
        </Flex>
      </Card>
    </View>
  );
};

export default Profile;