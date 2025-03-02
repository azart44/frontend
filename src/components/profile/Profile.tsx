import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Card,
  Flex,
  Loader,
  useAuthenticator
} from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';

import { useUserProfile } from '../../hooks/useProfile';
import ProfileCard from './ProfileCard';
import EditProfileForm from './EditProfileForm';
import TrackList from '../track/TrackList';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const { isAuthenticated, userId: authUserId } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);

  // Utiliser l'userId du paramètre d'URL ou celui de l'utilisateur authentifié
  const targetUserId = urlUserId || authUserId;

  // Récupérer le profil
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch 
  } = useUserProfile(targetUserId);

  // Déterminer si c'est le profil de l'utilisateur courant
  const isOwnProfile = useMemo(() => {
    return !urlUserId || urlUserId === authUserId;
  }, [urlUserId, authUserId]);

  // Gérer la mise à jour du profil
  const handleProfileUpdate = async () => {
    await refetch();
    setIsEditing(false);
  };

  // Afficher les logs pour le débogage
  useEffect(() => {
    console.log('Profile component - Auth state:', { isAuthenticated, authUserId });
    console.log('Profile component - Target userId:', targetUserId);
    console.log('Profile component - URL userId:', urlUserId);
  }, [isAuthenticated, authUserId, targetUserId, urlUserId]);

  // Si en cours de chargement
  if (isLoading) {
    return (
      <View padding="2rem">
        <Loader />
        <Text textAlign="center" marginTop="1rem">Chargement du profil...</Text>
      </View>
    );
  }

  // Si erreur
  if (error) {
    return (
      <View padding="2rem">
        <Heading level={3}>Erreur</Heading>
        <Text>Une erreur est survenue lors du chargement du profil.</Text>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <Button onClick={() => navigate(-1)} marginTop="1rem">Retour</Button>
      </View>
    );
  }

  // Si profil non trouvé
  if (!profile) {
    return (
      <View padding="2rem">
        <Heading level={3}>Profil non trouvé</Heading>
        <Text>Ce profil n'existe pas ou a été supprimé.</Text>
        <Text>ID utilisateur: {targetUserId || 'Non disponible'}</Text>
        <Button onClick={() => navigate('/')} marginTop="1rem">Retour à l'accueil</Button>
      </View>
    );
  }

  return (
    <View padding="2rem">
      {isEditing ? (
        <EditProfileForm 
          userProfile={profile} 
          onCancel={() => setIsEditing(false)}
          onSuccess={handleProfileUpdate}
        />
      ) : (
        <>
          <Flex direction="column" gap="2rem">
            {/* Carte de profil */}
            <ProfileCard profile={profile} />
            
            {/* Bouton d'édition (si c'est le profil de l'utilisateur) */}
            {isOwnProfile && (
              <Button onClick={() => setIsEditing(true)}>
                Modifier mon profil
              </Button>
            )}
            
            {/* Liste des pistes */}
            <Heading level={3}>Pistes</Heading>
            {targetUserId && <TrackList userId={targetUserId} />}
          </Flex>
        </>
      )}
    </View>
  );
};

export default Profile;