import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Card,
  Loader,
  useAuthenticator
} from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { useUserProfile } from '../../hooks/useProfile';
import ProfileCard from './ProfileCard';
import EditProfileForm from './EditProfileForm';
import TrackList from '../track/TrackList';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuthenticator((context) => [context.user]);
  
  const [cognitoUserId, setCognitoUserId] = useState<string | null>(null);

  // Récupérer l'ID utilisateur de Cognito
  useEffect(() => {
    const getUserId = async () => {
      try {
        const attributes = await fetchUserAttributes();
        // Vérification explicite pour éviter les undefined
        if (attributes.sub) {
          setCognitoUserId(attributes.sub);
        }
      } catch (error) {
        console.error('Erreur de récupération des attributs utilisateur:', error);
      }
    };

    getUserId();
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);

  // Utiliser l'userId du paramètre ou l'ID Cognito (sub)
  const targetUserId = userId || 
    (user?.attributes?.sub ?? null) || 
    cognitoUserId;

  // Récupérer le profil
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch 
  } = useUserProfile(targetUserId);

  // Déterminer si c'est le profil de l'utilisateur courant
  const isOwnProfile = useMemo(() => {
    const currentUserId = (user?.attributes?.sub ?? null) || cognitoUserId;
    return !userId || userId === currentUserId;
  }, [userId, user?.attributes, cognitoUserId]);

  // Gérer la mise à jour du profil
  const handleProfileUpdate = async () => {
    await refetch();
    setIsEditing(false);
  };

  // Le reste du code reste identique
  // ... (code précédent)
};

export default Profile;