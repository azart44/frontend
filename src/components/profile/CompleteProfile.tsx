import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button, Flex, Heading, Text, View, Loader, TextField, SelectField, Alert } from '@aws-amplify/ui-react';
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
  const { isAuthenticated, userId: authUserId } = useAuth();
  const [step, setStep] = useState(0); // Commencer à 0 pour inclure l'étape username
  const [profileData, setProfileData] = useState({
    userId: '',
    email: '',
    username: '', // Ajout du champ username
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
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const initializeProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          console.log("CompleteProfile - Initialisation avec l'utilisateur:", user);
          const attributes = await fetchUserAttributes();
          console.log("CompleteProfile - Attributs récupérés:", attributes);
          
          try {
            console.log("CompleteProfile - Tentative de récupération du profil existant");
            const response = await api.get('/user-profile');
            const userProfile = response.data;
            console.log("CompleteProfile - Profil récupéré:", userProfile);

            if (userProfile.profileCompleted) {
              console.log("CompleteProfile - Profil déjà complété, redirection vers l'accueil");
              navigate('/');
              return;
            }

            setProfileData(prev => ({
              ...prev,
              ...userProfile,
              email: attributes.email || '',
              userId: attributes.sub || user.username,
            }));
          } catch (error: any) {
            console.log("CompleteProfile - Erreur lors de la récupération du profil:", error);
            if (error.response && error.response.status === 404) {
              // Profile doesn't exist yet, initialize with default values
              console.log("CompleteProfile - Création d'un nouveau profil");
              setProfileData(prev => ({
                ...prev,
                userId: attributes.sub || user.username,
                email: attributes.email || ''
              }));
            } else {
              throw error;
            }
          }
        } catch (error: any) {
          console.error('Error initializing profile:', error);
          setError('Error initializing profile');
          setErrorDetails(error.response?.data || error.message || 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error('CompleteProfile - Aucun utilisateur trouvé dans le contexte Amplify');
        setError('No user found');
        setIsLoading(false);
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
    if (step === 0) {
      // Validation du pseudonyme
      if (!profileData.username) {
        alert("Veuillez entrer un pseudo");
        return;
      }
      setStep(prev => prev + 1);
    } else if (step < 8) { // +1 car on a ajouté une étape
      setStep(prev => prev + 1);
    } else {
      try {
        setIsLoading(true);
        console.log("CompleteProfile - Données de profil à envoyer:", profileData);
        
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
      } catch (error: any) {
        console.error('Error completing profile:', error);
        setError('Error completing profile');
        setErrorDetails(error.response?.data || error.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  // Créer manuellement un profil de base en cas d'erreur
  const handleCreateProfileManually = async () => {
    try {
      setIsLoading(true);
      console.log("CompleteProfile - Création manuelle du profil");
      
      const attributes = await fetchUserAttributes();
      const userId = attributes.sub || user?.username;
      
      if (!userId) {
        setError("Impossible de déterminer l'ID utilisateur");
        return;
      }
      
      const basicProfile = {
        userId: userId,
        email: attributes.email || '',
        username: `User_${userId.slice(-6)}`,
        profileCompleted: false
      };
      
      console.log("CompleteProfile - Envoi du profil de base:", basicProfile);
      
      await api.post('/user-profile', {
        profileData: basicProfile
      });
      
      setError(null);
      setErrorDetails(null);
      setProfileData(prev => ({
        ...prev,
        ...basicProfile
      }));
      
      // Rester sur la page pour continuer le processus
    } catch (error: any) {
      console.error('Error creating basic profile:', error);
      setError('Error creating basic profile');
      setErrorDetails(error.response?.data || error.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
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
        <Alert variation="error" heading="Erreur d'initialisation">
          {error}
        </Alert>
        
        <Flex justifyContent="center" marginTop="1rem">
          <Button onClick={() => setShowDebug(!showDebug)} marginRight="1rem">
            {showDebug ? 'Masquer les détails' : 'Afficher les détails'}
          </Button>
          
          <Button onClick={handleCreateProfileManually} variation="primary">
            Réessayer
          </Button>
          
          <Button onClick={() => navigate('/')} marginLeft="1rem" variation="link">
            Retour à l'accueil
          </Button>
        </Flex>
        
        {showDebug && (
          <View padding="1rem" backgroundColor="#f5f5f5" marginTop="1rem" borderRadius="medium">
            <Heading level={4}>Informations de débogage</Heading>
            <Text marginBottom="0.5rem">User: {JSON.stringify(user?.username)}</Text>
            <Text marginBottom="0.5rem">AuthContext userId: {authUserId}</Text>
            <Text marginBottom="0.5rem">Error Details:</Text>
            <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </View>
        )}
      </View>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={1}>Complétez votre profil</Heading>
      <ProgressBar value={step} max={8} />
      
      {step === 0 && (
        <TextField
          label="Choisissez un pseudo"
          name="username"
          value={profileData.username}
          onChange={handleInputChange}
          placeholder="Entrez votre pseudo"
          isRequired
        />
      )}
      
      {step === 1 && (
        <SelectField
          label="Mon rôle"
          name="userType"
          value={profileData.userType}
          onChange={handleInputChange}
        >
          <option value="">Sélectionnez un rôle</option>
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
          <option value="">Sélectionnez un niveau</option>
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
          placeholder="Ex: FL Studio, Ableton, MPC..."
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
              placeholder={`Nom de l'artiste ${index + 1}`}
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
          <option value="">Sélectionnez un genre</option>
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
          <option value="">Sélectionnez un mood</option>
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
          placeholder="Ex: Paris, Lyon, Marseille..."
        />
      )}
      
      {step === 8 && (
        <View padding="1rem" backgroundColor="#f5f5f5" borderRadius="medium">
          <Heading level={3}>Résumé de votre profil</Heading>
          <Text>Pseudo: {profileData.username}</Text>
          <Text>Rôle: {profileData.userType}</Text>
          <Text>Niveau d'expérience: {profileData.experienceLevel}</Text>
          <Text>Logiciel/Matériel: {profileData.software}</Text>
          <Text>Genre musical: {profileData.musicGenre}</Text>
          <Text>Mood musical: {profileData.musicalMood}</Text>
          <Text>Localisation: {profileData.location || 'Non spécifiée'}</Text>
          <Text marginTop="1rem">Cliquez sur "Terminer" pour valider votre profil.</Text>
        </View>
      )}
      
      <Flex justifyContent="space-between" marginTop="1rem">
        {step > 0 && <Button onClick={handleBack}>Précédent</Button>}
        <Button onClick={handleNext} variation="primary">{step === 8 ? 'Terminer' : 'Suivant'}</Button>
      </Flex>
    </View>
  );
};

export default CompleteProfile;