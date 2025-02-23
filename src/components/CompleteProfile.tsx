import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button, Flex, Heading, Text, ButtonVariations, View, Loader, TextField, TextAreaField, SelectField } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import axios, { AxiosError } from 'axios';
import { MUSIC_GENRES, SKILL_LEVELS, USER_TYPES } from '../constants/profileData';

const CompleteProfile: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [email, setEmail] = useState<string>('');
  const [userType, setUserType] = useState<string>(USER_TYPES[0].value);
  const [skillLevel, setSkillLevel] = useState<string>(SKILL_LEVELS[0]);
  const [influencingArtists, setInfluencingArtists] = useState<string>('');
  const [socialLinks, setSocialLinks] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const attributes = await fetchUserAttributes();
          if (attributes['custom:profileCompleted'] === 'true') {
            navigate('/');
          } else {
            setEmail(attributes.email || '');
          }
        } catch (error) {
          console.error('Error checking user attributes:', error);
          setError('Error checking profile completion');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('User not authenticated');
        setIsLoading(false);
      }
    };
    checkProfileCompletion();
  }, [user, navigate]);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const socialLinksObject = useMemo(() => {
    return Object.fromEntries(socialLinks.split(',').map(link => {
      const [platform, url] = link.split(':').map(s => s.trim());
      return [platform, url];
    }));
  }, [socialLinks]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/complete-profile', {
        item: {
          userId: user.username,
          email: email,
          userType: userType,
          musicGenres: selectedGenres,
          skillLevel: skillLevel,
          influencingArtists: influencingArtists.split(',').map(artist => artist.trim()),
          socialLinks: socialLinksObject,
          profileCompleted: true
        }
      });

      console.log('Profile update response:', response.data);

      if (response.status === 200) {
        await updateUserAttributes({
          userAttributes: {
            'custom:profileCompleted': 'true',
          }
        });
        navigate('/');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        setError('Error completing profile: ' + (axiosError.response?.data || axiosError.message));
      } else {
        setError('Error completing profile: ' + (error instanceof Error ? error.message : String(error)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, email, userType, selectedGenres, skillLevel, influencingArtists, socialLinksObject, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <View padding="1rem">
        <Heading level={1}>Error</Heading>
        <Text>{error}</Text>
        <Button onClick={() => navigate('/')} marginTop="1rem">
          Go to Home
        </Button>
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Complete Your Profile</Heading>
      <TextField
        label="Email"
        value={email}
        isDisabled={true}
        isRequired
        variation="quiet"
        descriptiveText="This email is associated with your account and cannot be changed here."
      />
      <SelectField
        label="User Type"
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        isRequired
      >
        {USER_TYPES.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </SelectField>
      <Heading level={3}>Select your favorite genres</Heading>
      <Flex wrap="wrap" justifyContent="center" marginTop="1rem">
        {MUSIC_GENRES.map(genre => (
          <Button
            key={genre}
            onClick={() => handleGenreChange(genre)}
            variation={selectedGenres.includes(genre) ? "primary" : "link" as ButtonVariations}
            margin="0.5rem"
          >
            {genre}
          </Button>
        ))}
      </Flex>
      <SelectField
        label="Skill Level"
        value={skillLevel}
        onChange={(e) => setSkillLevel(e.target.value)}
        isRequired
      >
        {SKILL_LEVELS.map(level => (
          <option key={level} value={level}>{level}</option>
        ))}
      </SelectField>
      <TextAreaField
        label="Influencing Artists"
        value={influencingArtists}
        onChange={(e) => setInfluencingArtists(e.target.value)}
        placeholder="Enter artists separated by commas"
      />
      <TextAreaField
        label="Social Links"
        value={socialLinks}
        onChange={(e) => setSocialLinks(e.target.value)}
        placeholder="Enter as platform:link, separated by commas (e.g., twitter:https://twitter.com/username)"
      />
      <Button
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Submitting..."
        marginTop="1rem"
      >
        Complete Profile
      </Button>
    </View>
  );
});

export default CompleteProfile;