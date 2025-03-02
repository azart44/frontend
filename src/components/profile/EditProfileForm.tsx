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
import { MUSIC_GENRES, EXPERIENCE_LEVELS, SOFTWARE_OPTIONS, POPULAR_ARTISTS } from '../../constants/profileData';
import { UserProfile } from '../../types/ProfileTypes';
import { useForm } from '../../hooks/useForm';
import { useUpdateProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';

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
  const { userId: authUserId } = useAuth();
  
  const { 
    values, 
    errors, 
    handleChange, 
    setValues,
    validate,
    resetForm
  } = useForm<Partial<UserProfile>>({
    username: userProfile.username || '',
    bio: userProfile.bio || '',
    experienceLevel: userProfile.experienceLevel || '',
    musicGenres: userProfile.musicGenres || [],
    tags: userProfile.tags || [],
    socialLinks: userProfile.socialLinks || {},
    location: userProfile.location || '',
    software: userProfile.software || '',
    musicalMood: userProfile.musicalMood || '',
    favoriteArtists: userProfile.favoriteArtists || [],
  });

  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (newProfileImage) {
      setPreviewImage(newProfileImage);
    } else if (userProfile.profileImageUrl) {
      setPreviewImage(userProfile.profileImageUrl);
    }
  }, [newProfileImage, userProfile.profileImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

  const handleArtistAdd = (artist: string) => {
    if (!artist) return;
    setValues(prev => {
      const currentArtists = prev.favoriteArtists || [];
      if (currentArtists.length < 3 && !currentArtists.includes(artist)) {
        return { ...prev, favoriteArtists: [...currentArtists, artist] };
      }
      return prev;
    });
  };

  const handleRemoveArtist = (artistToRemove: string) => {
    setValues(prev => ({
      ...prev,
      favoriteArtists: (prev.favoriteArtists || []).filter(artist => artist !== artistToRemove)
    }));
  };

  const handleGenreAdd = (genre: string) => {
    if (!genre) return;
    setValues(prev => {
      const currentGenres = prev.musicGenres || [];
      if (currentGenres.length < 3 && !currentGenres.includes(genre)) {
        return { ...prev, musicGenres: [...currentGenres, genre] };
      }
      return prev;
    });
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setValues(prev => ({
      ...prev,
      musicGenres: (prev.musicGenres || []).filter(genre => genre !== genreToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationRules = {
      username: (value: string) => !value ? 'Le pseudo est requis' : null,
      bio: (value: string) => 
        value.length > 150 ? 'La bio ne doit pas dépasser 150 caractères' : null,
    };
    
    if (!validate(validationRules)) {
      return;
    }

    const effectiveUserId = userProfile.userId || authUserId;
    if (!effectiveUserId) {
      console.error('Aucun ID utilisateur valide disponible');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        ...values,
        userId: effectiveUserId,
        profileImageUrl: newProfileImage || userProfile.profileImageUrl,
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
            placeholder="Entre ton pseudo"
          />
          
          <TextField
            label="Bio"
            name="bio"
            value={values.bio}
            onChange={handleChange}
            maxLength={150}
            hasError={!!errors.bio}
            errorMessage={errors.bio}
            placeholder="Présente-toi en quelques mots"
          />
          <Text fontSize="small">{`\${values.bio?.length || 0}/150`}</Text>
          
          <SelectField
            label="Niveau d'expérience"
            name="experienceLevel"
            value={values.experienceLevel}
            onChange={handleChange}
          >
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </SelectField>
          
          <SelectField
            label="Logiciel principal"
            name="software"
            value={values.software}
            onChange={handleChange}
          >
            {SOFTWARE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectField>
          
          <Heading level={5}>Tes artistes préférés</Heading>
          <SelectField
            label="Ajouter un artiste préféré (max 3)"
            onChange={(e) => handleArtistAdd(e.target.value)}
            value=""
          >
            <option value="">Sélectionne un artiste</option>
            {POPULAR_ARTISTS.map((artist: string) => (
              <option 
                key={artist} 
                value={artist}
                disabled={(values.favoriteArtists || []).includes(artist) || 
                         (values.favoriteArtists || []).length >= 3}
              >
                {artist}
              </option>
            ))}
          </SelectField>
          
          <Flex wrap="wrap" gap="0.5rem">
            {(values.favoriteArtists || []).map(artist => (
              <Text 
                key={artist}
                backgroundColor="rgba(0,0,0,0.1)"
                padding="0.3rem 0.5rem"
                borderRadius="1rem"
              >
                {artist}{' '}
                <span 
                  onClick={() => handleRemoveArtist(artist)}
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ×
                </span>
              </Text>
            ))}
          </Flex>
          
          <SelectField
            label="Ajouter un genre musical (max 3)"
            onChange={(e) => handleGenreAdd(e.target.value)}
            value=""
          >
            <option value="">Sélectionne un genre</option>
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
            placeholder="https://instagram.com/ton-compte"
          />
          
          <TextField
            label="SoundCloud (URL)"
            name="soundcloud"
            value={values.socialLinks?.soundcloud || ''}
            onChange={(e) => setValues(prev => ({ 
              ...prev, 
              socialLinks: { ...prev.socialLinks, soundcloud: e.target.value } 
            }))}
            placeholder="https://soundcloud.com/ton-compte"
          />
          
          <TextField
            label="Localisation"
            name="location"
            value={values.location}
            onChange={handleChange}
            placeholder="Ta ville ou région"
          />
          
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