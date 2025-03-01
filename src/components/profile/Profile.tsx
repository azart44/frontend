import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Card,
  Loader
} from '@aws-amplify/ui-react';
import { useQueryClient } from '@tanstack/react-query';

import { useUserProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import ProfileCard from './ProfileCard';
import EditProfileForm from './EditProfileForm';
import TrackList from '../track/TrackList';

const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated, userId: currentUserId } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);

  // Use custom hook for profile fetching
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch 
  } = useUserProfile(userId);

  // Determine if this is the user's own profile
  const isOwnProfile = useMemo(() => {
    return !userId || userId === currentUserId;
  }, [userId, currentUserId]);

  // Function to handle profile update
  const handleProfileUpdate = async () => {
    // Refresh profile data
    await refetch();
    // Exit edit mode
    setIsEditing(false);
  };

  // Loading and error states
  if (isLoading) return <Loader />;
  if (error) return <View padding="2rem"><Text color="red">Error loading profile</Text></View>;
  if (!profile) return <View padding="2rem"><Text>Profile not found</Text></View>;

  // Edit mode for own profile
  if (isEditing && isOwnProfile) {
    return (
      <EditProfileForm
        userProfile={profile}
        onCancel={() => setIsEditing(false)}
        onSuccess={handleProfileUpdate}
      />
    );
  }

  return (
    <View padding="2rem" backgroundColor="#f0f0f0">
      <ProfileCard profile={profile} />
      
      {isOwnProfile && isAuthenticated && (
        <Card variation="elevated" marginTop="1rem">
          <Button 
            onClick={() => setIsEditing(true)} 
            variation="primary" 
            isFullWidth
          >
            Modifier mon profil
          </Button>
        </Card>
      )}

      <Card variation="elevated" marginTop="2rem">
        <Heading level={2}>Tracks</Heading>
        <TrackList userId={profile.userId} />
      </Card>
    </View>
  );
};

export default React.memo(Profile);