import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { 
  Button, 
  Flex, 
  Heading, 
  View, 
  Card,
  SelectField,
  TextField,
  Alert
} from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const POPULAR_ARTISTS = [
  'Ninho', 'Drake', 'Travis Scott', 'Freeze Corleone', 
  'Jul', 'SCH', 'Damso', 'Nekfeu', 'Jay-Z', 'Kanye West',
  'Booba', 'Gradur', 'PNL', 'Hamza', 'Future', '21 Savage'
];

const MUSIC_GENRES = [
  'Drill', 'Trap', 'Boom Bap', 'RnB', 'Hip Hop', 
  'Afrobeat', 'Soul', 'Pop', 'Électronique'
];

const MUSIC_MOODS = [
  { value: 'Mélancolique', emoji: '😔' },
  { value: 'Festif', emoji: '🎉' },
  { value: 'Agressif', emoji: '💥' },
  { value: 'Motivant', emoji: '💪' },
  { value: 'Romantique', emoji: '❤️' },
  { value: 'Relaxant', emoji: '🧘' }
];

const USER_TYPES = [
  { value: 'Beatmaker', label: 'Beatmaker 🎹', emoji: '🎹' },
  { value: 'Rappeur', label: 'Rappeur 🎤', emoji: '🎤' },
  { value: 'Loopmaker', label: 'Loopmaker 🔄', emoji: '🔄' }
];

const EXPERIENCE_LEVELS = [
  { value: 'Débutant', label: 'Débutant 🌱', description: 'Je commence mon aventure musicale' },
  { value: 'Intermédiaire', label: 'Intermédiaire 🚀', description: 'Je développe mes compétences' },
  { value: 'Confirmé', label: 'Confirmé 🏆', description: 'Je maîtrise mon art' }
];

const SOFTWARE_OPTIONS = [
  { value: 'FL Studio', label: 'FL Studio 🎚️' },
  { value: 'Ableton Live', label: 'Ableton Live 🎛️' },
  { value: 'Logic Pro', label: 'Logic Pro 🍏' },
  { value: 'Maschine', label: 'Maschine 🥁' },
  { value: 'Reason', label: 'Reason 🤖' },
  { value: 'Pro Tools', label: 'Pro Tools 🎧' },
  { value: 'Hardware MPC', label: 'MPC Hardware 🎚️' },
  { value: 'Autre', label: 'Autre / En développement 🛠️' }
];

interface ProfileData {
  userId: string;
  email: string;
  username: string;
  userType: string;
  experienceLevel: string;
  software: string;
  favoriteArtists: string[];
  musicGenres: string[];
  musicalMood: string;
  location: string;
}

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userId, refreshAuth } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    userId: '',
    email: '',
    username: '',
    userType: '',
    experienceLevel: '',
    software: '',
    favoriteArtists: ['', '', ''],
    musicGenres: [],
    musicalMood: '',
    location: ''
  });

  const generateDefaultUsername = (userId: string, email: string): string => {
    return email.split('@')[0] || `user${userId.slice(-5)}`;
  };

  useEffect(() => {
    const initializeProfile = async () => {
      if (!isAuthenticated || !userId) {
        return;
      }

      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';
        
        const defaultUsername = 
          attributes.username || 
          generateDefaultUsername(userId, email);
        
        setProfileData(prev => ({
          ...prev,
          userId: userId,
          email: email,
          username: defaultUsername
        }));
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
      }
    };

    initializeProfile();
  }, [isAuthenticated, userId]);

  const handleArtistChange = (index: number, value: string) => {
    const newArtists = [...profileData.favoriteArtists];
    newArtists[index] = value;
    setProfileData(prev => ({ ...prev, favoriteArtists: newArtists }));
  };

  const handleGenreAdd = (genre: string) => {
    setProfileData(prev => {
      const currentGenres = prev.musicGenres || [];
      if (currentGenres.length < 3 && !currentGenres.includes(genre)) {
        return { ...prev, musicGenres: [...currentGenres, genre] };
      }
      return prev;
    });
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      musicGenres: (prev.musicGenres || []).filter(genre => genre !== genreToRemove)
    }));
  };

  const handleNext = () => {
    switch(step) {
      case 0:
        if (!profileData.username.trim()) {
          alert('Merci de choisir un pseudo');
          return;
        }
        break;
      case 1:
        if (!profileData.userType) {
          alert('Merci de sélectionner un rôle');
          return;
        }
        break;
      case 2:
        if (!profileData.experienceLevel) {
          alert('Merci de sélectionner votre niveau');
          return;
        }
        break;
      case 3:
        if (!profileData.software) {
          alert('Merci de sélectionner votre logiciel');
          return;
        }
        break;
      case 4:
        const filledArtists = profileData.favoriteArtists.filter(a => a.trim());
        if (filledArtists.length === 0) {
          alert('Merci de sélectionner au moins un artiste');
          return;
        }
        break;
      case 5:
        if (profileData.musicGenres.length === 0) {
          alert('Merci de sélectionner au moins un genre musical');
          return;
        }
        break;
      case 6:
        if (!profileData.musicalMood) {
          alert('Merci de sélectionner votre mood musical');
          return;
        }
        break;
    }

    setStep(prev => Math.min(prev + 1, 7));
  };
  const handleSubmit = async () => {
    if (!isAuthenticated || !userId) {
      setError('Vous devez être connecté pour compléter votre profil');
      return;
    }

    const requiredFields: (keyof ProfileData)[] = ['username', 'userType', 'experienceLevel', 'software', 'musicalMood'];
    const missingFields = requiredFields.filter(field => {
      const value = profileData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      setError(`Merci de remplir tous les champs requis: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const completeProfileData = {
        ...profileData,
        profileCompleted: true,
        userId: userId
      };

      await api.post('/user-profile', { profileData: completeProfileData });

      await refreshAuth();

      navigate('/profile');
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      setError('Impossible de terminer la configuration du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 0:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Choisis ton pseudo</Heading>
            <TextField
              label="Pseudo"
              value={profileData.username}
              onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Entre ton pseudo"
            />
          </Card>
        );
      case 1:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Ton rôle principal</Heading>
            <SelectField
              label="Rôle"
              value={profileData.userType}
              onChange={(e) => setProfileData(prev => ({ ...prev, userType: e.target.value }))}
            >
              <option value="">Sélectionne un rôle</option>
              {USER_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </SelectField>
          </Card>
        );
      case 2:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Ton niveau d'expérience</Heading>
            <SelectField
              label="Niveau"
              value={profileData.experienceLevel}
              onChange={(e) => setProfileData(prev => ({ ...prev, experienceLevel: e.target.value }))}
            >
              <option value="">Sélectionne ton niveau</option>
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </SelectField>
          </Card>
        );
      case 3:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Ton logiciel principal</Heading>
            <SelectField
              label="Logiciel"
              value={profileData.software}
              onChange={(e) => setProfileData(prev => ({ ...prev, software: e.target.value }))}
            >
              <option value="">Sélectionne ton logiciel</option>
              {SOFTWARE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </Card>
        );
      case 4:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Tes artistes préférés</Heading>
            <Flex direction="column" gap="1rem">
              {[0, 1, 2].map(index => (
                <SelectField
                  key={index}
                  label={`Artiste ${index + 1}`}
                  value={profileData.favoriteArtists[index]}
                  onChange={(e) => handleArtistChange(index, e.target.value)}
                  placeholder="Choisis un artiste"
                >
                  <option value="">Sélectionne un artiste</option>
                  {POPULAR_ARTISTS.map(artist => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </SelectField>
              ))}
            </Flex>
          </Card>
        );
      case 5:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Tes genres musicaux</Heading>
            <Flex direction="column" gap="1rem">
              <SelectField
                label="Ajouter un genre musical"
                onChange={(e) => handleGenreAdd(e.target.value)}
                value=""
              >
                <option value="">Sélectionne un genre</option>
                {MUSIC_GENRES.map(genre => (
                  <option 
                    key={genre} 
                    value={genre}
                    disabled={(profileData.musicGenres || []).includes(genre) || 
                             (profileData.musicGenres || []).length >= 3}
                  >
                    {genre}
                  </option>
                ))}
              </SelectField>
              
              <Flex wrap="wrap" gap="0.5rem" marginTop="1rem">
                {(profileData.musicGenres || []).map(genre => (
                  <Button
                    key={genre}
                    variation="link"
                    size="small"
                    onClick={() => handleRemoveGenre(genre)}
                  >
                    {genre} ✕
                  </Button>
                ))}
              </Flex>
            </Flex>
          </Card>
        );
      case 6:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Ton mood musical</Heading>
            <SelectField
              label="Mood"
              value={profileData.musicalMood}
              onChange={(e) => setProfileData(prev => ({ ...prev, musicalMood: e.target.value }))}
            >
              <option value="">Sélectionne ton mood</option>
              {MUSIC_MOODS.map(mood => (
                <option key={mood.value} value={mood.value}>
                  {mood.emoji} {mood.value}
                </option>
              ))}
            </SelectField>
          </Card>
        );
      case 7:
        return (
          <Card variation="elevated" padding="2rem">
            <Heading level={3} marginBottom="1rem">Confirmation</Heading>
            <Flex direction="column" gap="1rem">
              <p>Merci d'avoir complété ton profil !</p>
              <p>Clique sur "Créer mon profil" pour finaliser.</p>
            </Flex>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <View padding="2rem" maxWidth="600px" margin="0 auto" backgroundColor="#f4f4f4">
      {error && (
        <Alert 
          variation="error" 
          marginBottom="1rem"
          isDismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card variation="elevated" padding="2rem">
        <Heading level={2} textAlign="center" marginBottom="2rem">
          🎵 Bienvenue sur Chordora
        </Heading>
        
        {renderStepContent()}
        
        <Flex justifyContent="space-between" marginTop="2rem">
          {step > 0 && (
            <Button 
              onClick={() => setStep(prev => prev - 1)} 
              variation="link"
              isDisabled={isLoading}
            >
              Précédent
            </Button>
          )}
          <Button 
            onClick={step === 7 ? handleSubmit : handleNext}
            variation="primary"
            isLoading={isLoading}
          >
            {step === 7 ? 'Créer mon profil' : 'Suivant'}
          </Button>
        </Flex>
      </Card>
    </View>
  );
};

export default CompleteProfile;