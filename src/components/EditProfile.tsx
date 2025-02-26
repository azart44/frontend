import React, { useState } from 'react';
import { 
  View, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Button, 
  TextField, 
  SelectField, 
  Card,
  Image,
  Loader
} from '@aws-amplify/ui-react';
import { MUSIC_GENRES, SKILL_LEVELS, USER_TYPES } from '../constants/profileData';
import { UserProfile } from '../types/ProfileTypes';
import api from '../utils/api';

interface EditProfileProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onProfileUpdate: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ 
  userProfile, 
  setUserProfile, 
  setIsEditing, 
  onProfileUpdate 
}) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleMusicGenresChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === "") return;
    setEditedProfile(prev => ({
      ...prev,
      musicGenres: prev.musicGenres ? [...prev.musicGenres, value].slice(0, 3) : [value]
    }));
  };

  const removeGenre = (genreToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      musicGenres: prev.musicGenres ? prev.musicGenres.filter(genre => genre !== genreToRemove) : []
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const profileToUpdate = {
        ...editedProfile,
        profileImageBase64: newProfileImage || editedProfile.profileImageBase64
      };
      const response = await api.post('/complete-profile', { profileData: profileToUpdate });
      setUserProfile(response.data.updatedProfile);
      setIsEditing(false);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileImageSrc = () => {
    if (newProfileImage) {
      return newProfileImage;
    }
    if (editedProfile.profileImageBase64) {
      return editedProfile.profileImageBase64.startsWith('data:image') 
        ? editedProfile.profileImageBase64 
        : `data:image/jpeg;base64,\${editedProfile.profileImageBase64}`;
    }
    return '/path/to/default/image.jpg';
  };

  if (isLoading) return <Loader />;

  return (
    <View padding="2rem" backgroundColor="#f0f0f0">
      <Card>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <Heading level={3}>Edit Profile</Heading>
            
            <Flex direction="column" alignItems="center">
              <Image
                src={getProfileImageSrc()}
                alt="Profile Picture"
                width="150px"
                height="150px"
                objectFit="cover"
                borderRadius="50%"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginTop: '1rem' }}
              />
            </Flex>

            <SelectField
              label="User Type"
              name="userType"
              value={editedProfile.userType}
              onChange={handleInputChange}
            >
              {USER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </SelectField>

            <SelectField
              label="Experience Level"
              name="experienceLevel"
              value={editedProfile.experienceLevel}
              onChange={handleInputChange}
            >
              {SKILL_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </SelectField>

            <TextField
              label="Bio"
              name="bio"
              value={editedProfile.bio || ''}
              onChange={handleInputChange}
              maxLength={150}
            />

            <TextField
              label="Tags (comma-separated, max 3)"
              name="tags"
              value={editedProfile.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).slice(0, 3);
                setEditedProfile(prev => ({ ...prev, tags }));
              }}
            />

            <SelectField
              label="Add Music Genre (max 3)"
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
              {editedProfile.musicGenres?.map((genre) => (
                <Badge key={genre} variation="info">
                  {genre}
                  <Button size="small" onClick={() => removeGenre(genre)}>X</Button>
                </Badge>
              ))}
            </Flex>

            <TextField
              label="Instagram"
              name="instagram"
              value={editedProfile.socialLinks?.instagram || ''}
              onChange={(e) => setEditedProfile(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, instagram: e.target.value } 
              }))}
            />

            <TextField
              label="SoundCloud"
              name="soundcloud"
              value={editedProfile.socialLinks?.soundcloud || ''}
              onChange={(e) => setEditedProfile(prev => ({ 
                ...prev, 
                socialLinks: { ...prev.socialLinks, soundcloud: e.target.value } 
              }))}
            />

            {error && <Text color="red">{error}</Text>}
            <Flex gap="1rem">
              <Button type="submit" variation="primary" flex={1} isLoading={isLoading}>Save Changes</Button>
              <Button onClick={() => setIsEditing(false)} variation="warning" flex={1}>Cancel</Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </View>
  );
};

export default EditProfile;