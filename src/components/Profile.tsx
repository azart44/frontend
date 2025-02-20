import React, { useEffect, useState, useCallback } from 'react';
import { 
  useAuthenticator, 
  View, 
  Heading, 
  Text, 
  Loader, 
  Badge, 
  Flex, 
  Button, 
  TextField, 
  SelectField,
  Card,
  Image,
} from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { MUSIC_GENRES, SKILL_LEVELS, USER_TYPES } from '../constants/profileData';
import { FaTwitter, FaInstagram, FaSoundcloud, FaYoutube } from 'react-icons/fa';

interface UserProfile {
  userId: string;
  email: string;
  userType: string;
  musicGenres: string[];
  skillLevel: string;
  influencingArtists: string[];
  socialLinks: { [key: string]: string };
  profileCompleted: boolean;
}

const Profile: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (user && isAuthenticated) {
      try {
        setIsLoading(true);
        const response = await api.get<UserProfile>('/get-user-profile', {
          params: { userId: user.username }
        });
        setUserProfile(response.data);
        setEditedProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Error fetching user profile. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleMusicGenresChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === "") return;
    setEditedProfile(prev => {
      if (!prev) return null;
      const updatedGenres = prev.musicGenres.includes(value)
        ? prev.musicGenres
        : [...prev.musicGenres, value];
      return { ...prev, musicGenres: updatedGenres };
    });
  };

  const removeGenre = (genreToRemove: string) => {
    setEditedProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        musicGenres: prev.musicGenres.filter(genre => genre !== genreToRemove)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProfile) return;

    try {
      setIsLoading(true);
      await api.post('/complete-profile', { item: editedProfile });
      setUserProfile(editedProfile);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const SocialIcon = ({ platform, url }: { platform: string, url: string }) => {
    const iconMap: { [key: string]: React.ElementType } = {
      twitter: FaTwitter,
      instagram: FaInstagram,
      soundcloud: FaSoundcloud,
      youtube: FaYoutube,
    };
    const IconComponent = iconMap[platform.toLowerCase()];
    return IconComponent ? <IconComponent size={24} onClick={() => window.open(url, '_blank')} style={{ cursor: 'pointer', marginRight: '10px' }} /> : null;
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <View padding="2rem" textAlign="center">
        <Loader variation="linear" />
        <Text fontSize="1.2rem" fontWeight="bold" marginTop="1rem">Loading your beats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View padding="2rem" textAlign="center">
        <Heading level={1}>Oops! Something went wrong</Heading>
        <Text>{error}</Text>
        <Button onClick={fetchUserProfile} marginTop="1rem">Try Again</Button>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View padding="2rem" textAlign="center">
        <Heading level={1}>Profile Not Found</Heading>
        <Text>We couldn't find your beats. Let's set up your profile!</Text>
        <Button onClick={() => {/* Naviguer vers la page de création de profil */}} marginTop="1rem">Create Profile</Button>
      </View>
    );
  }

  return (
    <View padding="2rem" backgroundColor="#f0f0f0">
      <Card>
        <Flex direction="column" alignItems="center">
          <Image
            src="https://placeholder.com/150" // Remplacer par l'URL de l'avatar de l'utilisateur
            alt="Profile Picture"
            width="150px"
            height="150px"
            objectFit="cover"
            borderRadius="50%"
          />
          <Heading level={1} marginTop="1rem">{userProfile.userId}</Heading>
          <Text>{userProfile.email}</Text>
          <Badge variation="info" marginTop="0.5rem">{userProfile.userType}</Badge>
          <Badge variation="success">{userProfile.skillLevel}</Badge>
          
          <Flex marginTop="1rem">
            {userProfile.socialLinks && Object.entries(userProfile.socialLinks).map(([platform, url]) => (
              <SocialIcon key={platform} platform={platform} url={url} />
            ))}
          </Flex>
        </Flex>

        <Card variation="elevated" marginTop="2rem">
          <Heading level={3}>Music Genres</Heading>
          <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
            {userProfile.musicGenres.map((genre) => (
              <Badge key={genre} variation="info">
                {genre}
              </Badge>
            ))}
          </Flex>
        </Card>

        <Card variation="elevated" marginTop="2rem">
          <Heading level={3}>Influencing Artists</Heading>
          <Text marginTop="1rem">{userProfile.influencingArtists.join(', ')}</Text>
        </Card>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} marginTop="2rem" variation="primary" isFullWidth>
            Edit Profile
          </Button>
        )}
      </Card>

      {isEditing && (
        <Card marginTop="2rem">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="1rem">
              <SelectField
                label="User Type"
                name="userType"
                value={editedProfile?.userType || ''}
                onChange={handleInputChange}
              >
                {USER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </SelectField>
              <SelectField
                label="Skill Level"
                name="skillLevel"
                value={editedProfile?.skillLevel || ''}
                onChange={handleInputChange}
              >
                {SKILL_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </SelectField>
              <SelectField
                label="Add Music Genre"
                name="musicGenres"
                value=""
                onChange={handleMusicGenresChange}
              >
                <option value="">Select a genre</option>
                {MUSIC_GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </SelectField>
              <Flex wrap="wrap" gap="0.5rem">
                {editedProfile?.musicGenres.map((genre) => (
                  <Badge key={genre} variation="info">
                    {genre}
                    <Button
                      size="small"
                      onClick={() => removeGenre(genre)}
                    >
                      X
                    </Button>
                  </Badge>
                ))}
              </Flex>
              <TextField
                label="Influencing Artists (comma-separated)"
                name="influencingArtists"
                value={editedProfile?.influencingArtists.join(', ') || ''}
                onChange={(e) => setEditedProfile(prev => prev ? { ...prev, influencingArtists: e.target.value.split(',').map(artist => artist.trim()) } : null)}
              />
              <Flex gap="1rem">
                <Button type="submit" variation="primary" flex={1}>Save Changes</Button>
                <Button onClick={() => setIsEditing(false)} variation="link" flex={1}>Cancel</Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      )}
    </View>
  );
};

export default Profile;