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
} from '@aws-amplify/ui-react';
import { MUSIC_GENRES, SKILL_LEVELS, USER_TYPES } from '../../constants/profileData';
import { UserProfile } from '../../types/ProfileTypes';
import { useForm } from '../../hooks/useForm';
import { useUpdateProfile } from '../../hooks/useProfile';

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
  
  // Utilisation du hook de formulaire
  const { 
    values, 
    errors, 
    handleChange, 
    setValues,
    validate 
  } = useForm<Partial<UserProfile>>({
    userId: userProfile.userId,
    username: userProfile.username || '',  // Assurez-vous que username n'est pas undefined
    userType: userProfile.userType,
    experienceLevel: userProfile.experienceLevel,
    bio: userProfile.bio || '',
    tags: userProfile.tags || [],
    musicGenres: userProfile.musicGenres || [],
    socialLinks: userProfile.socialLinks || { instagram: '', soundcloud: '' }
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
  
  // Gérer l'ajout de genres musicaux
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
  
  // Supprimer un genre musical
  const handleRemoveGenre = (genreToRemove: string) => {
    setValues(prev => ({
      ...prev,
      musicGenres: (prev.musicGenres || []).filter(genre => genre !== genreToRemove)
    }));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire
    const validationRules = {
      bio: (value: string) => 
        value.length > 150 ? 'La bio ne doit pas dépasser 150 caractères' : null,
      username: (value: string) =>
        !value ? 'Le pseudo est requis' : null,
    };
    
    if (!validate(validationRules)) {
      return;
    }

    console.log("Données à envoyer :", {
      ...values,
      profileImageBase64: newProfileImage || userProfile.profileImageBase64,
      userId: userProfile.userId
    });
    
    try {
      await updateProfileMutation.mutateAsync({
        ...values,
        profileImageBase64: newProfileImage || userProfile.profileImageBase64,
        userId: userProfile.userId
      });
      
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };
  
  return (
    <View padding="2rem" backgroundColor="#f5f5f5">
      <Heading level={3} marginBottom="1rem">Modifier mon profil</Heading>
      
      <form onSubmit={handleSubmit}>
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
          
          {/* Champs de formulaire */}
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
            {USER_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </SelectField>
          
          <SelectField
            label="Niveau d'expérience"
            name="experienceLevel"
            value={values.experienceLevel}
            onChange={handleChange}
          >
            {SKILL_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </SelectField>
          
          <TextField
            label="Bio"
            name="bio"
            value={values.bio}
            onChange={handleChange}
            maxLength={150}
            hasError={!!errors.bio}
            errorMessage={errors.bio}
            placeholder="Présentez-vous en quelques mots"
          />
          <Text fontSize="small">{`${values.bio?.length || 0}/150`}</Text>
          
          <TextField
            label="Tags (séparés par des virgules, max 3)"
            value={(values.tags || []).join(', ')}
            onChange={handleTagsChange}
            placeholder="Ex: Trap, Melodique, 808"
          />
          
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
          <Flex wrap="wrap" gap="0.5rem">
            {(values.musicGenres || []).map(genre => (
              <Text 
                key={genre}
                backgroundColor="rgba(0,0,0,0.1)"
                padding="0.3rem 0.5rem"
                borderRadius="1rem"
              >
                {genre}{' '}
                <span 
                  onClick={() => handleRemoveGenre(genre)}
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ×
                </span>
              </Text>
            ))}
          </Flex>
          
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
          
          {/* Boutons de soumission */}
          <Flex gap="1rem" marginTop="1rem">
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
        </Flex>
      </form>
    </View>
  );
};

export default React.memo(EditProfileForm);