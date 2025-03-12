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
  Alert, 
  Image,
  CheckboxField,
  Grid
} from '@aws-amplify/ui-react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useUpdateProfile } from '../../hooks/useProfile';
import { 
  MUSIC_GENRES, 
  USER_ROLES, 
  MUSIC_MOODS, 
  SOFTWARE_OPTIONS, 
  EQUIPMENT_OPTIONS,
  AVAILABILITY_STATUS 
} from '../../constants/profileData';

// Configuration des étapes
const PROFILE_STEPS = [
  {
    id: 'username',
    title: 'Choisissez un pseudo',
    description: 'Ce nom sera visible par tous les utilisateurs de la plateforme'
  },
  {
    id: 'userType',
    title: 'Votre rôle',
    description: 'Indiquez votre rôle principal dans la création musicale'
  },
  {
    id: 'availability',
    title: 'Votre statut',
    description: 'Indiquez aux autres votre disponibilité actuelle'
  },
  {
    id: 'software',
    title: 'Votre logiciel principal',
    description: 'Quel DAW ou logiciel utilisez-vous principalement?'
  },
  {
    id: 'equipment',
    title: 'Votre équipement',
    description: 'Sélectionnez l\'équipement que vous utilisez régulièrement'
  },
  {
    id: 'musicGenres',
    title: 'Vos genres musicaux préférés',
    description: 'Choisissez jusqu\'à 3 genres musicaux'
  },
  {
    id: 'musicalMood',
    title: 'Votre mood musical',
    description: 'Quel est le mood qui caractérise le mieux votre style?'
  },
  {
    id: 'favoriteArtists',
    title: 'Vos artistes favoris',
    description: 'Partagez vos influences et inspirations'
  },
  {
    id: 'location',
    title: 'Votre localisation',
    description: 'Optionnel - Aide à trouver des collaborateurs près de chez vous'
  },
  {
    id: 'summary',
    title: 'Finalisez votre profil',
    description: 'Vérifiez et confirmez vos informations'
  }
];

// Barre de progression
const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = (value / max) * 100; 
  return (
    <View width="100%" height="8px" backgroundColor="#e0e0e0" borderRadius="4px" marginBottom="1rem">
      <View 
        width={`${percentage}%`} 
        height="100%" 
        style={{ 
          backgroundColor: "#4CAF50", 
          borderRadius: "4px", 
          transition: "width 0.3s ease" 
        }}
      />
    </View>
  );
};

export default CompleteProfile;

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isProfileComplete, userId, refreshAuth } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const [profileData, setProfileData] = useState({
    userId: '',
    email: '',
    username: '',
    userType: '',
    availabilityStatus: '',
    software: '',
    equipment: [] as string[],
    musicGenres: [] as string[],
    musicalMood: '',
    favoriteArtists: ['', '', ''],
    location: '',
    profileCompleted: false
  });

  // Définir les handlers avant de les utiliser
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier la taille (max 5 Mo)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const initializeProfile = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setError("Vous devez être connecté pour accéder à cette page.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const attributes = await fetchUserAttributes();
      
      // Tenter de récupérer le profil existant s'il existe
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        const response = await fetch(`/api/user-profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const existingProfile = await response.json();
          
          if (existingProfile?.profileCompleted) {
            navigate('/profile');
            return;
          }
          
          // Initialiser avec les données existantes
          setProfileData(prev => ({
            ...prev,
            ...existingProfile,
            userId: userId,
            email: attributes.email || ''
          }));
          
          // Initialiser les états pour l'équipement et les genres
          if (existingProfile.equipment) setSelectedEquipment(existingProfile.equipment);
          if (existingProfile.musicGenres) setSelectedGenres(existingProfile.musicGenres);
          
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Profil existant non trouvé, création d\'un nouveau profil');
      }
      
      // Si on arrive ici, c'est qu'on n'a pas pu récupérer de profil existant
      setProfileData(prev => ({
        ...prev,
        userId: userId,
        email: attributes.email || '',
        username: attributes.preferred_username || `User_${userId.slice(-6)}`
      }));
      
    } catch (error: any) {
      console.error('Erreur d\'initialisation:', error);
      setError('Impossible de charger votre profil. Veuillez réessayer.');
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.startsWith('equipment_')) {
      const equipment = name.replace('equipment_', '');
      if (checked) {
        setSelectedEquipment(prev => [...prev, equipment]);
      } else {
        setSelectedEquipment(prev => prev.filter(item => item !== equipment));
      }
    }
  };

  const handleGenreChange = (genre: string, isSelected: boolean) => {
    if (isSelected) {
      if (selectedGenres.length < 3) {
        setSelectedGenres(prev => [...prev, genre]);
      }
    } else {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    }
  };

  const handleArtistChange = (index: number, value: string) => {
    setProfileData(prev => {
      const newArtists = [...prev.favoriteArtists];
      newArtists[index] = value;
      return { ...prev, favoriteArtists: newArtists };
    });
  };

  // Récupérer les options de statut de disponibilité basées sur le type d'utilisateur
  const getAvailabilityOptions = () => {
    const userType = profileData.userType?.toLowerCase() || 'rappeur';
    if (userType === 'beatmaker' || userType === 'loopmaker') {
      return AVAILABILITY_STATUS.beatmaker; // Beatmaker et Loopmaker ont les mêmes options
    }
    return AVAILABILITY_STATUS.rappeur;
  };

  const handleNext = async () => {
    // Validation avant de passer à l'étape suivante
    switch (PROFILE_STEPS[step].id) {
      case 'username':
        if (!profileData.username.trim()) {
          alert('Veuillez saisir un pseudo');
          return;
        }
        break;
      case 'userType':
        if (!profileData.userType) {
          alert('Veuillez sélectionner un rôle');
          return;
        }
        break;
      case 'availability':
        if (!profileData.availabilityStatus) {
          alert('Veuillez sélectionner un statut de disponibilité');
          return;
        }
        break;
      case 'summary':
        try {
          setIsLoading(true);
          
          // Préparer les données finales
          const finalProfileData = {
            ...profileData,
            equipment: selectedEquipment,
            musicGenres: selectedGenres,
            profileCompleted: true,
            profileImageBase64: profileImage
          };
          
          // Mettre à jour le profil
          await updateProfileMutation.mutateAsync(finalProfileData as any);
          
          // Mettre à jour les attributs Cognito
          await updateUserAttributes({
            userAttributes: {
              'custom:profileCompleted': 'true',
              'custom:userType': profileData.userType
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
    
    // Mettre à jour les listes dans profileData avant de passer à l'étape suivante
    if (PROFILE_STEPS[step].id === 'equipment') {
      setProfileData(prev => ({ ...prev, equipment: selectedEquipment }));
    } else if (PROFILE_STEPS[step].id === 'musicGenres') {
      setProfileData(prev => ({ ...prev, musicGenres: selectedGenres }));
    }
    
    // Passer à l'étape suivante
    setStep(prev => Math.min(prev + 1, PROFILE_STEPS.length - 1));
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

  const renderStepContent = () => {
    const currentStep = PROFILE_STEPS[step];
    
    switch (currentStep.id) {
      case 'username':
        return (
          <Flex direction="column" gap="1rem">
            <Flex direction="column" alignItems="center" marginBottom="1.5rem">
              <Image
                src={profileImage || "/default-profile.jpg"}
                alt="Profile Preview"
                width="150px"
                height="150px"
                objectFit="cover"
                borderRadius="50%"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ marginTop: '1rem' }}
                required
              />
              <Text fontSize="small" color="gray">
                Formats acceptés: JPG, PNG, WEBP. Max: 5Mo
              </Text>
            </Flex>
            
            <TextField
              label="Pseudo"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              placeholder="Entrez votre pseudo"
              isRequired
              size="large"
            />
          </Flex>
        );
      
      case 'userType':
        return (
          <Flex direction="column" gap="1rem">
            <SelectField
              label="Votre rôle principal"
              name="userType"
              value={profileData.userType}
              onChange={handleInputChange}
              isRequired
              size="large"
            >
              <option value="">Sélectionnez votre rôle</option>
              {USER_ROLES.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </SelectField>
          </Flex>
        );

      case 'availability':
        return (
          <Flex direction="column" gap="1rem">
            <SelectField
              label="Votre statut de disponibilité"
              name="availabilityStatus"
              value={profileData.availabilityStatus}
              onChange={handleInputChange}
              isRequired
              size="large"
            >
              <option value="">Sélectionnez votre statut</option>
              {getAvailabilityOptions().map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </SelectField>
            <Text fontSize="small" color="gray">
              Ce statut indique aux autres utilisateurs votre disponibilité actuelle pour des collaborations
            </Text>
          </Flex>
        );
      
      case 'software':
        return (
          <Flex direction="column" gap="1rem">
            <SelectField
              label="Logiciel principal"
              name="software"
              value={profileData.software}
              onChange={handleInputChange}
              size="large"
            >
              <option value="">Sélectionnez un logiciel</option>
              {SOFTWARE_OPTIONS.map(software => (
                <option key={software} value={software}>{software}</option>
              ))}
            </SelectField>
          </Flex>
        );
      
      case 'equipment':
        return (
          <Flex direction="column" gap="1rem">
            <Text marginBottom="1rem">Sélectionnez l'équipement que vous utilisez (plusieurs choix possibles)</Text>
            <Grid
              templateColumns={{ base: "1fr", medium: "1fr 1fr" }}
              gap="0.5rem"
            >
              {EQUIPMENT_OPTIONS.map(equipment => (
                <CheckboxField
                  key={equipment}
                  name={`equipment_${equipment}`}
                  label={equipment}
                  checked={selectedEquipment.includes(equipment)}
                  onChange={handleCheckboxChange}
                />
              ))}
            </Grid>
          </Flex>
        );
      
      case 'musicGenres':
        return (
          <Flex direction="column" gap="1rem">
            <Text marginBottom="0.5rem">Sélectionnez jusqu'à 3 genres musicaux favoris</Text>
            <Grid
              templateColumns={{ base: "1fr", medium: "1fr 1fr 1fr" }}
              gap="0.5rem"
              marginBottom="1rem"
            >
              {MUSIC_GENRES.map(genre => (
                <Button
                  key={genre}
                  onClick={() => handleGenreChange(genre, !selectedGenres.includes(genre))}
                  variation={selectedGenres.includes(genre) ? "primary" : "menu"}
                  isDisabled={!selectedGenres.includes(genre) && selectedGenres.length >= 3}
                >
                  {genre}
                </Button>
              ))}
            </Grid>
            <Text fontSize="small" color="gray">
              {selectedGenres.length}/3 genres sélectionnés
            </Text>
          </Flex>
        );
      
      case 'musicalMood':
        return (
          <Flex direction="column" gap="1rem">
            <SelectField
              label="Mood musical principal"
              name="musicalMood"
              value={profileData.musicalMood}
              onChange={handleInputChange}
              size="large"
            >
              <option value="">Sélectionnez un mood</option>
              {MUSIC_MOODS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </SelectField>
          </Flex>
        );
      
      case 'favoriteArtists':
        return (
          <Flex direction="column" gap="1rem">
            <Text marginBottom="0.5rem">Partagez vos principales influences musicales</Text>
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
        );
      
      case 'location':
        return (
          <Flex direction="column" gap="1rem">
            <TextField
              label="Votre ville ou région (optionnel)"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              placeholder="Ex: Paris, Lyon, Marseille..."
              size="large"
            />
            <Text fontSize="small" color="gray">
              Cette information peut vous aider à trouver des collaborateurs près de chez vous
            </Text>
          </Flex>
        );
      
      case 'summary':
        return (
          <View backgroundColor="#f5f5f5" padding="1.5rem" borderRadius="8px">
            <Heading level={4} marginBottom="1rem">Résumé de votre profil</Heading>
            <Flex alignItems="center" marginBottom="1.5rem">
              <Image
                src={profileImage || "/default-profile.jpg"}
                alt="Profile Preview"
                width="100px"
                height="100px"
                objectFit="cover"
                borderRadius="50%"
                marginRight="1rem"
              />
              <Flex direction="column">
                <Text fontWeight="bold">{profileData.username}</Text>
                <Text>{profileData.userType}</Text>
                {profileData.location && <Text>{profileData.location}</Text>}
              </Flex>
            </Flex>
            
            <Grid
              templateColumns={{ base: "1fr", medium: "1fr 1fr" }}
              gap="1rem"
              marginBottom="1rem"
            >
              <View>
                <Text fontWeight="bold">Statut de disponibilité</Text>
                <Text>
                  {getAvailabilityOptions().find(option => option.value === profileData.availabilityStatus)?.label || 'Non spécifié'}
                </Text>
              </View>

              <View>
                <Text fontWeight="bold">Logiciel principal</Text>
                <Text>{profileData.software || 'Non spécifié'}</Text>
              </View>
              
              <View>
                <Text fontWeight="bold">Mood musical</Text>
                <Text>{profileData.musicalMood || 'Non spécifié'}</Text>
              </View>
              
              {selectedGenres.length > 0 && (
                <View>
                  <Text fontWeight="bold">Genres musicaux</Text>
                  <Flex gap="0.5rem" wrap="wrap">
                    {selectedGenres.map(genre => (
                      <Text 
                        key={genre}
                        backgroundColor="rgba(0,0,0,0.1)"
                        padding="0.2rem 0.5rem"
                        borderRadius="1rem"
                        fontSize="small"
                      >
                        {genre}
                      </Text>
                    ))}
                  </Flex>
                </View>
              )}
              
              {selectedEquipment.length > 0 && (
                <View>
                  <Text fontWeight="bold">Équipement</Text>
                  <Text>{selectedEquipment.join(', ')}</Text>
                </View>
              )}
              
              {profileData.favoriteArtists.filter(a => a).length > 0 && (
                <View>
                  <Text fontWeight="bold">Artistes favoris</Text>
                  <Text>{profileData.favoriteArtists.filter(a => a).join(', ')}</Text>
                </View>
              )}
            </Grid>
            
            <Text fontSize="small" color="gray">
              En confirmant, vous finalisez votre profil et pourrez accéder à toutes les fonctionnalités de Chordora.
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View padding="1rem" maxWidth="600px" margin="0 auto">
      <Heading level={2} textAlign="center" marginBottom="1rem">
        Compléter votre profil
      </Heading>
      
      <Heading level={4} marginBottom="0.5rem">
        {PROFILE_STEPS[step].title}
      </Heading>
      
      <Text marginBottom="1.5rem" color="gray">
        {PROFILE_STEPS[step].description}
      </Text>
      
      <ProgressBar value={step} max={PROFILE_STEPS.length - 1} />
      
      {renderStepContent()}
      
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
          isLoading={updateProfileMutation.isPending}
        >
          {step === PROFILE_STEPS.length - 1 ? 'Confirmer et terminer' : 'Suivant'}
        </Button>
      </Flex>
    </View>
  );
};