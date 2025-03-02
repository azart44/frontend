import React, { useEffect, useState } from 'react';
import { 
  View, 
  Heading, 
  TextField, 
  SelectField, 
  Button, 
  Flex, 
  Text,
  Image,
  Divider,
  TextAreaField,
  Badge
} from '@aws-amplify/ui-react';
import { MUSIC_GENRES, EXPERIENCE_LEVELS, USER_ROLES, MUSIC_MOODS, SOFTWARE_OPTIONS, EQUIPMENT_OPTIONS } from '../../constants/profileData';
import { UserProfile } from '../../types/ProfileTypes';
import { useForm } from '../../hooks/useForm';
import { useUpdateProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';

// Composant d'onglets simple personnalisé (puisque celui d'Amplify pose des problèmes)
interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Array<{id: string, label: string}>;
}

const SimpleTabs: React.FC<TabProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <Flex justifyContent="center" marginBottom="1.5rem">
      {tabs.map(tab => (
        <Button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          variation={activeTab === tab.id ? "primary" : "menu"}
          style={{ 
            borderRadius: '4px',
            margin: '0 0.25rem',
            padding: '0.5rem 1rem'
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Flex>
  );
};

interface EditProfileFormProps {
  userProfile: UserProfile;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ 
  userProfile, 
  onCancel, 
  onSuccess 
}) => {
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const { updateLocalProfile } = useAuth();
  
  // Utilisation du hook de formulaire
  const { 
    values, 
    errors, 
    handleChange, 
    setValues,
    validate 
  } = useForm<Partial<UserProfile>>({
    userId: userProfile.userId,
    username: userProfile.username || '',
    userType: userProfile.userType,
    experienceLevel: userProfile.experienceLevel,
    bio: userProfile.bio || '',
    location: userProfile.location || '',
    tags: userProfile.tags || [],
    musicGenres: userProfile.musicGenres || [],
    musicalMood: userProfile.musicalMood || '',
    software: userProfile.software || '',
    equipment: userProfile.equipment || [],
    favoriteArtists: userProfile.favoriteArtists || ['', '', ''],
    socialLinks: userProfile.socialLinks || { 
      instagram: '', 
      soundcloud: '', 
      youtube: '', 
      twitter: '' 
    }
  });
  
  // Hook de mutation pour la mise à jour du profil
  const updateProfileMutation = useUpdateProfile();
  
  // Mettre à jour l'aperçu de l'image
  useEffect(() => {
    if (newProfileImage) {
      setPreviewImage(newProfileImage);
    } else if (userProfile.profileImageUrl) {
      setPreviewImage(userProfile.profileImageUrl);
    } else if (userProfile.profileImageBase64) {
      setPreviewImage(
        userProfile.profileImageBase64.startsWith('data:image') 
          ? userProfile.profileImageBase64 
          : `data:image/jpeg;base64,${userProfile.profileImageBase64}`
      );
    }
  }, [newProfileImage, userProfile.profileImageBase64, userProfile.profileImageUrl]);
  
  // Configuration des onglets
  const tabs = [
    { id: 'basic', label: 'Infos de base' },
    { id: 'musical', label: 'Style musical' },
    { id: 'social', label: 'Réseaux sociaux' }
  ];

  // Gérer le changement d'image
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
        setNewProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Gérer l'ajout/suppression de tags
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 3); // Limite de 3 tags
    
    setValues(prev => ({ ...prev, tags: tagsArray }));
  };
  
  // Gérer l'ajout d'un genre musical
  const handleMusicGenreAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (!value) return;
    
    const currentGenres = values.musicGenres || [];
    
    // Limiter à 3 genres et éviter les doublons
    if (currentGenres.length < 3 && !currentGenres.includes(value)) {
      setValues(prev => ({
        ...prev,
        musicGenres: [...currentGenres, value]
      }));
    }
    
    // Réinitialiser la valeur du select
    e.target.value = '';
  };
  
  // Gérer l'ajout d'un équipement
  const handleEquipmentAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (!value) return;
    
    const currentEquipment = values.equipment || [];
    
    // Éviter les doublons
    if (!currentEquipment.includes(value)) {
      setValues(prev => ({
        ...prev,
        equipment: [...currentEquipment, value]
      }));
    }
    
    // Réinitialiser la valeur du select
    e.target.value = '';
  };
  
  // Supprimer un genre musical
  const handleRemoveGenre = (genreToRemove: string) => {
    setValues(prev => ({
      ...prev,
      musicGenres: (prev.musicGenres || []).filter(genre => genre !== genreToRemove)
    }));
  };
  
  // Supprimer un équipement
  const handleRemoveEquipment = (equipmentToRemove: string) => {
    setValues(prev => ({
      ...prev,
      equipment: (prev.equipment || []).filter(item => item !== equipmentToRemove)
    }));
  };
  
  // Gérer le changement d'un artiste favori
  const handleArtistChange = (index: number, value: string) => {
    const newArtists = [...(values.favoriteArtists || ['', '', ''])];
    newArtists[index] = value;
    setValues(prev => ({ ...prev, favoriteArtists: newArtists }));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire
    const validationRules = {
      bio: (value: string | undefined) => 
        value && value.length > 150 ? 'La bio ne doit pas dépasser 150 caractères' : null,
      username: (value: string | undefined) =>
        !value ? 'Le pseudo est requis' : null,
    };
    
    if (!validate(validationRules)) {
      return;
    }

    try {
      // Préparer les données à envoyer
      const profileData = {
        ...values,
        profileImageBase64: newProfileImage || userProfile.profileImageBase64,
        userId: userProfile.userId
      };
      
      await updateProfileMutation.mutateAsync(profileData);
      
      // Mettre à jour le profil dans le contexte
      if (updateLocalProfile) {
        updateLocalProfile(profileData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };
  
  return (
    <View padding="2rem" backgroundColor="#f5f5f5">
      <Heading level={3} marginBottom="1rem">Modifier mon profil</Heading>
      
      {/* Utiliser le composant SimpleTabs au lieu de Tabs d'Amplify */}
      <SimpleTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={tabs} 
      />
      
      <form onSubmit={handleSubmit}>
        {/* Onglet Informations de base */}
        {activeTab === 'basic' && (
          <Flex direction="column" gap="1rem">
            {/* Image de profil */}
            <Flex direction="column" alignItems="center" marginBottom="1rem">
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Profile Preview"
                  width="150px"
                  height="150px"
                  objectFit="cover"
                  borderRadius="50%"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ marginTop: '1rem' }}
              />
              <Text fontSize="small" color="gray">
                Formats acceptés: JPG, PNG, WEBP. Max: 5Mo
              </Text>
            </Flex>
            
            <TextField
              label="Pseudo"
              name="username"
              value={values.username}
              onChange={handleChange}
              required
              hasError={!!errors.username}
              errorMessage={errors.username}
              placeholder="Entrez votre pseudo"
            />
            
            <SelectField
              label="Type de compte"
              name="userType"
              value={values.userType}
              onChange={handleChange}
            >
              <option value="">Sélectionnez un type</option>
              {USER_ROLES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </SelectField>
            
            <SelectField
              label="Niveau d'expérience"
              name="experienceLevel"
              value={values.experienceLevel}
              onChange={handleChange}
            >
              <option value="">Sélectionnez un niveau</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </SelectField>
            
            <TextAreaField
              label="Bio"
              name="bio"
              value={values.bio}
              onChange={handleChange}
              maxLength={150}
              hasError={!!errors.bio}
              errorMessage={errors.bio}
              placeholder="Présentez-vous en quelques mots"
              rows={3}
            />
            <Text fontSize="small">{`${values.bio?.length || 0}/150`}</Text>
            
            <TextField
              label="Localisation"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="Ex: Paris, Lyon, Marseille..."
            />
            
            <TextField
              label="Tags (séparés par des virgules, max 3)"
              value={(values.tags || []).join(', ')}
              onChange={handleTagsChange}
              placeholder="Ex: Trap, Melodique, 808"
            />
            
            {/* Affichage des tags sélectionnés */}
            <Flex wrap="wrap" gap="0.5rem">
              {(values.tags || []).map(tag => (
                <Text 
                  key={tag}
                  backgroundColor="rgba(0,0,0,0.1)"
                  padding="0.3rem 0.5rem"
                  borderRadius="1rem"
                >
                  {tag}{' '}
                  <span 
                    onClick={() => setValues(prev => ({ 
                      ...prev, 
                      tags: (prev.tags || []).filter(t => t !== tag) 
                    }))}
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ×
                  </span>
                </Text>
              ))}
            </Flex>
          </Flex>
        )}
        
        {/* Onglet Style musical */}
        {activeTab === 'musical' && (
          <Flex direction="column" gap="1rem">
            <SelectField
              label="Ajouter un genre musical (max 3)"
              onChange={handleMusicGenreAdd}
              value=""
            >
              <option value="">Sélectionner un genre</option>
              {MUSIC_GENRES.map(genre => (
                <option 
                  key={genre} 
                  value={genre}
                  disabled={(values.musicGenres || []).includes(genre) || 
                           (values.musicGenres || []).length >= 3}
                >
                  {genre}
                </option>
              ))}
            </SelectField>
            
            {/* Affichage des genres sélectionnés */}
            <Flex wrap="wrap" gap="0.5rem" marginBottom="1rem">
              {(values.musicGenres || []).map(genre => (
                <Badge 
                  key={genre}
                  variation="info"
                  style={{ 
                    padding: '0.4rem 0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {genre}
                  <span 
                    onClick={() => handleRemoveGenre(genre)}
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </Flex>
            
            <SelectField
              label="Mood musical"
              name="musicalMood"
              value={values.musicalMood}
              onChange={handleChange}
            >
              <option value="">Sélectionner un mood</option>
              {MUSIC_MOODS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </SelectField>
            
            <Divider marginTop="1rem" marginBottom="1rem" />
            
            <Heading level={5}>Logiciel & équipement</Heading>
            
            <SelectField
              label="Logiciel principal"
              name="software"
              value={values.software}
              onChange={handleChange}
            >
              <option value="">Sélectionner un logiciel</option>
              {SOFTWARE_OPTIONS.map(software => (
                <option key={software} value={software}>{software}</option>
              ))}
            </SelectField>
            
            <SelectField
              label="Ajouter de l'équipement"
              onChange={handleEquipmentAdd}
              value=""
            >
              <option value="">Sélectionner un équipement</option>
              {EQUIPMENT_OPTIONS.map(equipment => (
                <option 
                  key={equipment} 
                  value={equipment}
                  disabled={(values.equipment || []).includes(equipment)}
                >
                  {equipment}
                </option>
              ))}
            </SelectField>
            
            {/* Affichage des équipements sélectionnés */}
            <Flex wrap="wrap" gap="0.5rem" marginBottom="1rem">
              {(values.equipment || []).map(item => (
                <Badge 
                  key={item}
                  variation="warning"
                  style={{ 
                    padding: '0.4rem 0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {item}
                  <span 
                    onClick={() => handleRemoveEquipment(item)}
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </Flex>
            
            <Divider marginTop="1rem" marginBottom="1rem" />
            
            <Heading level={5}>Artistes favoris</Heading>
            {[0, 1, 2].map(index => (
              <TextField
                key={index}
                label={`Artiste ${index + 1}`}
                value={values.favoriteArtists?.[index] || ''}
                onChange={(e) => handleArtistChange(index, e.target.value)}
                placeholder={`Nom de l'artiste ${index + 1}`}
              />
            ))}
          </Flex>
        )}
        
        {/* Onglet Réseaux sociaux */}
        {activeTab === 'social' && (
          <Flex direction="column" gap="1rem">
            <TextField
              label="Instagram (URL)"
              name="instagram"
              value={values.socialLinks?.instagram || ''}
              onChange={(e) => setValues(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, instagram: e.target.value } 
              }))}
              placeholder="https://instagram.com/votre-compte"
            />
            
            <TextField
              label="SoundCloud (URL)"
              name="soundcloud"
              value={values.socialLinks?.soundcloud || ''}
              onChange={(e) => setValues(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, soundcloud: e.target.value } 
              }))}
              placeholder="https://soundcloud.com/votre-compte"
            />
            
            <TextField
              label="YouTube (URL)"
              name="youtube"
              value={values.socialLinks?.youtube || ''}
              onChange={(e) => setValues(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, youtube: e.target.value } 
              }))}
              placeholder="https://youtube.com/c/votre-chaîne"
            />
            
            <TextField
              label="Twitter (URL)"
              name="twitter"
              value={values.socialLinks?.twitter || ''}
              onChange={(e) => setValues(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, twitter: e.target.value } 
              }))}
              placeholder="https://twitter.com/votre-compte"
            />
          </Flex>
        )}
        
        {/* Boutons de soumission (affichés en bas de chaque onglet) */}
        <Flex gap="1rem" marginTop="2rem">
          <Button 
            type="submit" 
            variation="primary" 
            flex={1}
            isLoading={updateProfileMutation.isPending}
          >
            Enregistrer
          </Button>
          <Button 
            onClick={onCancel} 
            variation="warning" 
            flex={1}
          >
            Annuler
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default React.memo(EditProfileForm);