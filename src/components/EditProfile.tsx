import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Badge, 
  Flex, 
  Button, 
  TextField, 
  SelectField, 
  Card,
  Image,
  Heading
} from '@aws-amplify/ui-react';
import api from '../utils/api';
import { MUSIC_GENRES, SKILL_LEVELS, USER_TYPES } from '../constants/profileData';
import { UserProfile } from '../types/ProfileTypes';
import { uploadData } from '@aws-amplify/storage';
import { getProfileImageUrl, fetchProfileImage } from '../utils/ProfileUtils';
import localforage from 'localforage';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (userProfile.userId) {
        const imageUrl = await fetchProfileImage(userProfile.userId);
        setPreviewImage(imageUrl);
      }
    };
    loadProfileImage();
  }, [userProfile.userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleMusicGenresChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === "") return;
    setEditedProfile(prev => ({
      ...prev,
      musicGenres: prev.musicGenres.includes(value) ? prev.musicGenres : [...prev.musicGenres, value]
    }));
  };

  const removeGenre = (genreToRemove: string) => {
    setEditedProfile(prev => ({
      ...prev,
      musicGenres: prev.musicGenres.filter(genre => genre !== genreToRemove)
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsLoading(true);
        const fileName = `users/${userProfile.userId}/profile-image`;
        
        await uploadData({
          key: fileName,
          data: file,
          options: {
            contentType: file.type,
          },
        }).result;

        const signedUrl = await getProfileImageUrl(fileName);
        if (signedUrl) {
          setEditedProfile(prev => ({ ...prev, profileImage: signedUrl }));
          setPreviewImage(signedUrl);
          // Mettre à jour le cache avec la nouvelle URL
          await localforage.setItem(`profileImage_${userProfile.userId}`, signedUrl);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post('/complete-profile', { item: editedProfile });
      setUserProfile(editedProfile);
      setIsEditing(false);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View padding="2rem" backgroundColor="#f0f0f0">
      <Card>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <Heading level={3}>Edit Profile</Heading>
            
            <Flex direction="column" alignItems="center" gap="1rem">
              <Image
                src={previewImage || undefined}
                alt="Profile Picture"
                width="150px"
                height="150px"
                objectFit="cover"
                borderRadius="50%"
              />
              <Flex direction="column" alignItems="center">
                <Text>Current Profile Logo</Text>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: '0.5rem' }}
                  aria-label="Choose new profile logo"
                />
                <Text fontSize="0.8rem" color="gray">Choose a new logo to update your profile picture</Text>
              </Flex>
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
              label="Skill Level"
              name="skillLevel"
              value={editedProfile.skillLevel}
              onChange={handleInputChange}
            >
              {SKILL_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </SelectField>
            <SelectField
              label="Add Music Genre"
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
              {editedProfile.musicGenres.map((genre) => (
                <Badge key={genre} variation="info">
                  {genre}
                  <Button
                    size="small"
                    onClick={() => removeGenre(genre)}
                  >
                    X
                  </Button>
                </Badge>
              ))}
            </Flex>
            <TextField
              label="Influencing Artists (comma-separated)"
              name="influencingArtists"
              value={editedProfile.influencingArtists.join(', ')}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, influencingArtists: e.target.value.split(',').map(artist => artist.trim()) }))}
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