import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button, Flex, Heading, Text, View, Loader, TextField, SelectField } from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const USER_TYPES = ['Beatmaker', 'Rappeur', 'Les deux'];
const EXPERIENCE_LEVELS = ['Débutant', 'Intermédiaire', 'Confirmé'];
const MUSIC_GENRES = ['Drill', 'Trap', 'Boom Bap', 'RnB'];
const MOODS = ['Mélancolique', 'Festif', 'Agressif'];

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = (value / max) * 100; 
  return (
    <View width="100%" height="10px" backgroundColor="#e0e0e0" borderRadius="5px" marginBottom="1rem">
      <View width={`${percentage}%`} height="100%" backgroundColor="#4CAF50" borderRadius="5px" />
    </View>
  );
};

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    userId: '',
    email: '',
    userType: '',
    experienceLevel: '',
    software: '',
    favoriteArtists: ['', '', ''],
    musicGenre: '',
    musicalMood: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const attributes = await fetchUserAttributes();
          
          try {
            const response = await api.get('/user-profile');
            const userProfile = response.data;

            if (userProfile.profileCompleted) {
              navigate('/');
              return;
            }

            setProfileData(prev => ({
              ...prev,
              ...userProfile,
              email: attributes.email || ''
            }));
          } catch (error: any) {
            if (error.response && error.response.status === 404) {
              // Profile doesn't exist yet, initialize with default values
              setProfileData(prev => ({
                ...prev,
                userId: user.username,
                email: attributes.email || ''
              }));
            } else {
              throw error;
            }
          }
        } catch (error) {
          console.error('Error initializing profile:', error);
          setError('Error initializing profile');
        } finally {
          setIsLoading(false);
        }
      }
    };
    initializeProfile();
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleArtistChange = (index: number, value: string) => {
    setProfileData(prev => {
      const newArtists = [...prev.favoriteArtists];
      newArtists[index] = value;
      return { ...prev, favoriteArtists: newArtists };
    });
  };

  const handleNext = async () => {
    if (step < 7) {
      setStep(prev => prev + 1);
    } else {
      try {
        setIsLoading(true);
        await api.post('/user-profile', {
          profileData: {
            ...profileData,
            profileCompleted: true
          }
        });
        await updateUserAttributes({
          userAttributes: {
            'custom:profileCompleted': 'true',
          }
        });
        navigate('/');
      } catch (error) {
        console.error('Error completing profile:', error);
        setError('Error completing profile');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

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
      <ProgressBar value={step} max={7} />
      {step === 1 && (
        <SelectField
          label="Mon rôle"
          name="userType"
          value={profileData.userType}
          onChange={handleInputChange}
        >
          {USER_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </SelectField>
      )}
      {step === 2 && (
        <SelectField
          label="Mon niveau d'expérience"
          name="experienceLevel"
          value={profileData.experienceLevel}
          onChange={handleInputChange}
        >
          {EXPERIENCE_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </SelectField>
      )}
      {step === 3 && (
        <TextField
          label="Le logiciel ou matériel que j'utilise"
          name="software"
          value={profileData.software}
          onChange={handleInputChange}
        />
      )}
      {step === 4 && (
        <Flex direction="column">
          <Heading level={3}>Mes 3 artistes favoris</Heading>
          {[0, 1, 2].map(index => (
            <TextField
              key={index}
              label={`Artiste ${index + 1}`}
              value={profileData.favoriteArtists[index]}
              onChange={(e) => handleArtistChange(index, e.target.value)}
            />
          ))}
        </Flex>
      )}
      {step === 5 && (
        <SelectField
          label="Mon genre musical préféré"
          name="musicGenre"
          value={profileData.musicGenre}
          onChange={handleInputChange}
        >
          {MUSIC_GENRES.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </SelectField>
      )}
      {step === 6 && (
        <SelectField
          label="Mon mood musical préféré"
          name="musicalMood"
          value={profileData.musicalMood}
          onChange={handleInputChange}
        >
          {MOODS.map(mood => (
            <option key={mood} value={mood}>{mood}</option>
          ))}
        </SelectField>
      )}
      {step === 7 && (
        <TextField
          label="Ma ville ou région (optionnel)"
          name="location"
          value={profileData.location}
          onChange={handleInputChange}
        />
      )}
      <Flex justifyContent="space-between" marginTop="1rem">
        {step > 1 && <Button onClick={handleBack}>Précédent</Button>}
        <Button onClick={handleNext}>{step === 7 ? 'Terminer' : 'Suivant'}</Button>
      </Flex>
    </View>
  );
};

export default CompleteProfile;