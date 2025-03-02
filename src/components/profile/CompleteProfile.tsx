import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  Button, 
  Flex, 
  Heading, 
  Text, 
  View, 
  Loader, 
  TextField, 
  SelectField, 
  Alert 
} from '@aws-amplify/ui-react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

// Configuration des données statiques
const USER_TYPES = [
  { value: 'Beatmaker', label: 'Beatmaker' },
  { value: 'Rappeur', label: 'Rappeur' },
  { value: 'Loopmaker', label: 'Loopmaker' }
];

const EXPERIENCE_LEVELS = [
  { value: 'Débutant', label: 'Débutant' },
  { value: 'Intermédiaire', label: 'Intermédiaire' },
  { value: 'Confirmé', label: 'Confirmé' }
];

const MUSIC_GENRES = [
  'Drill', 'Trap', 'Boom Bap', 'RnB', 'Hip Hop', 
  'Afrobeat', 'Soul', 'Pop', 'Électronique'
];

const MUSIC_MOODS = [
  'Mélancolique', 'Festif', 'Agressif', 
  'Motivant', 'Romantique', 'Relaxant'
];

const SOFTWARE_OPTIONS = [
  'FL Studio', 'Ableton Live', 'Logic Pro', 
  'Maschine', 'Reason', 'Pro Tools', 
  'Autre', 'Hardware MPC', 'Autre Hardware'
];

// Barre de progression
const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = (value / max) * 100; 
  return (
    <View width="100%" height="10px" backgroundColor="#e0e0e0" borderRadius="5px" marginBottom="1rem">
      <View 
        width={`\${percentage}%`} 
        height="100%" 
        style={{ 
          backgroundColor: "#4CAF50", 
          borderRadius: "5px", 
          transition: "width 0.3s ease" 
        }}
      />
    </View>
  );
};

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isProfileComplete, userId, refreshAuth } = useAuth();
  
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    userId: '',
    email: '',
    username: '',
    userType: '',
    experienceLevel: '',
    software: '',
    favoriteArtists: ['', '', ''],
    musicGenre: '',
    musicalMood: '',
    location: ''
  });

  const initializeProfile = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setError("Vous devez être connecté pour accéder à cette page.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const attributes = await fetchUserAttributes();
      const response = await api.get(`/user-profile/\${userId}`);
      const existingProfile = response.data;
      
      if (existingProfile?.profileCompleted) {
        navigate('/profile');
        return;
      }
      
      setProfileData(prev => ({
        ...prev,
        userId: userId,
        email: attributes.email || '',
        username: existingProfile?.username || attributes.username || `User_\${userId.slice(-6)}`
      }));
    } catch (error: any) {
      console.error('Erreur d\'initialisation:', error);
      if (error.response?.status === 404) {
        const attributes = await fetchUserAttributes();
        setProfileData(prev => ({
          ...prev,
          userId: userId,
          email: attributes.email || '',
          username: attributes.username || `User_\${userId.slice(-6)}`
        }));
      } else {
        setError('Impossible de charger votre profil. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, navigate, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      initializeProfile();
    }
  }, [isAuthenticated, initializeProfile]);

  useEffect(() => {
    if (isAuthenticated && isProfileComplete) {
      navigate('/profile');
    }
  }, [isAuthenticated, isProfileComplete, navigate]);

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
    switch (step) {
      case 0:
        if (!profileData.username.trim()) {
          alert('Veuillez saisir un pseudo');
          return;
        }
        break;
      case 1:
        if (!profileData.userType) {
          alert('Veuillez sélectionner un rôle');
          return;
        }
        break;
      case 8:
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
              'custom:profileCompleted': 'true'
            }
          });
          
          await refreshAuth();
          navigate('/profile');
          return;
        } catch (error) {
          console.error('Erreur de soumission:', error);
          alert('Impossible de terminer la configuration du profil');
          return;
        } finally {
          setIsLoading(false);
        }
    }
    
    setStep(prev => Math.min(prev + 1, 8));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <View padding="2rem" textAlign="center">
        <Loader />
        <Text marginTop="1rem">Chargement de votre profil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View padding="2rem">
        <Alert variation="error" heading="Erreur">
          {error}
        </Alert>
        <Button onClick={() => navigate('/')} marginTop="1rem">
          Retour à l'accueil
        </Button>
      </View>
    );
  }

  return (
    <View padding="1rem" maxWidth="600px" margin="0 auto">
      <Heading level={2} textAlign="center" marginBottom="2rem">
        Compléter votre profil
      </Heading>
      
      <ProgressBar value={step} max={8} />
      
      {step === 0 && (
        <TextField
          label="Choisissez un pseudo"
          name="username"
          value={profileData.username}
          onChange={handleInputChange}
          placeholder="Entrez votre pseudo"
          isRequired
          variation="quiet"
          size="large"
        />
      )}
      
      {step === 1 && (
        <SelectField
          label="Votre rôle"
          name="userType"
          value={profileData.userType}
          onChange={handleInputChange}
          isRequired
          variation="quiet"
          size="large"
        >
          <option value="">Sélectionnez votre rôle</option>
          {USER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </SelectField>
      )}
      
      {step === 2 && (
        <SelectField
          label="Votre niveau d'expérience"
          name="experienceLevel"
          value={profileData.experienceLevel}
          onChange={handleInputChange}
          isRequired
          variation="quiet"
          size="large"
        >
          <option value="">Sélectionnez votre niveau</option>
          {EXPERIENCE_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </SelectField>
      )}
      
      {step === 3 && (
        <SelectField
          label="Votre logiciel ou matériel principal"
          name="software"
          value={profileData.software}
          onChange={handleInputChange}
          isRequired
          variation="quiet"
          size="large"
        >
          <option value="">Sélectionnez votre outil principal</option>
          {SOFTWARE_OPTIONS.map(software => (
            <option key={software} value={software}>
              {software}
            </option>
          ))}
        </SelectField>
      )}
      
      {step === 4 && (
        <Flex direction="column" gap="1rem">
          <Heading level={4}>Vos 3 artistes favoris</Heading>
          {[0, 1, 2].map(index => (
            <TextField
              key={index}
              label={`Artiste \${index + 1}`}
              value={profileData.favoriteArtists[index]}
              onChange={(e) => handleArtistChange(index, e.target.value)}
              placeholder={`Nom de l'artiste \${index + 1}`}
              variation="quiet"
            />
          ))}
        </Flex>
      )}
      
      {step === 5 && (
        <SelectField
          label="Votre genre musical préféré"
          name="musicGenre"
          value={profileData.musicGenre}
          onChange={handleInputChange}
          isRequired
          variation="quiet"
          size="large"
        >
          <option value="">Sélectionnez un genre</option>
          {MUSIC_GENRES.map(genre => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </SelectField>
      )}
      
      {step === 6 && (
        <SelectField
          label="Votre mood musical"
          name="musicalMood"
          value={profileData.musicalMood}
          onChange={handleInputChange}
          isRequired
          variation="quiet"
          size="large"
        >
          <option value="">Sélectionnez un mood</option>
          {MUSIC_MOODS.map(mood => (
            <option key={mood} value={mood}>
              {mood}
            </option>
          ))}
        </SelectField>
      )}
      
      {step === 7 && (
        <TextField
          label="Votre ville ou région (optionnel)"
          name="location"
          value={profileData.location}
          onChange={handleInputChange}
          placeholder="Ex: Paris, Lyon, Marseille..."
          variation="quiet"
        />
      )}
      
      {step === 8 && (
        <View backgroundColor="#f0f0f0" padding="1rem" borderRadius="8px">
          <Heading level={4} marginBottom="1rem">Résumé de votre profil</Heading>
          <Text>Pseudo : {profileData.username}</Text>
          <Text>Rôle : {profileData.userType}</Text>
          <Text>Niveau : {profileData.experienceLevel}</Text>
          <Text>Logiciel : {profileData.software}</Text>
          <Text>Genre musical : {profileData.musicGenre}</Text>
          <Text>Mood musical : {profileData.musicalMood}</Text>
          <Text>Localisation : {profileData.location || 'Non spécifiée'}</Text>
        </View>
      )}
      
      <Flex justifyContent="space-between" marginTop="2rem">
        {step > 0 && (
          <Button 
            onClick={handleBack} 
            variation="link"
            size="large"
          >
            Précédent
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          variation="primary"
          size="large"
        >
          {step === 8 ? 'Terminer' : 'Suivant'}
        </Button>
      </Flex>
    </View>
  );
};

export default CompleteProfile