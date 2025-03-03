import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { 
  View, 
  Heading, 
  Text, 
  Button, 
  Card,
  Flex,
  Loader,
  Alert
} from '@aws-amplify/ui-react';
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
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const targetUserId = urlUserId || authUserId;

  const { 
    data: profile, 
    isLoading, 
    error,
    refetch
  } = useUserProfile(targetUserId);

  const isOwnProfile = useMemo(() => {
    return !urlUserId || urlUserId === authUserId;
  }, [urlUserId, authUserId]);

  const handleProfileUpdate = async () => {
    await refetch();
    setIsEditing(false);
  };

  useEffect(() => {
    console.log('Profile component - Auth state:', { isAuthenticated, authUserId });
    console.log('Profile component - Target userId:', targetUserId);
    console.log('Profile component - URL userId:', urlUserId);
    console.log('Profile component - Profile data:', profile);
  }, [isAuthenticated, authUserId, targetUserId, urlUserId, profile]);

  if (isLoading) {
    return (
      <View padding="2rem">
        <Loader />
        <Text textAlign="center" marginTop="1rem">Chargement du profil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View padding="2rem">
        <Alert variation="error" heading="Erreur">
          Une erreur est survenue lors du chargement du profil.
        </Alert>
        
        <Button onClick={() => setShowDebugInfo(!showDebugInfo)} marginTop="1rem">
          {showDebugInfo ? 'Masquer les détails d\'erreur' : 'Afficher les détails d\'erreur'}
        </Button>
        
        {showDebugInfo && (
          <Card variation="outlined" marginTop="1rem">
            <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </Card>
        )}
        
        <Button onClick={() => navigate(-1)} marginTop="1rem">
          Retour
        </Button>
      </View>
    );
  }

  if (!profile && isOwnProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!profile) {
    return (
      <View padding="2rem">
        <Alert variation="warning" heading="Profil non trouvé">
          Ce profil n'existe pas ou a été supprimé.
        </Alert>
        <Flex marginTop="1rem" gap="1rem">
          <Button onClick={() => navigate('/')} variation="primary">
            Retour à l'accueil
          </Button>
          <Button onClick={() => refetch()} variation="link">
            Réessayer
          </Button>
        </Flex>
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
            <Heading level={2} textAlign="center">
              {profile.username ? profile.username : 'Profil Utilisateur'}
            </Heading>
            
            <ProfileCard profile={profile} />
            
            {isOwnProfile && (
              <Button onClick={() => setIsEditing(true)}>
                Modifier mon profil
              </Button>
            )}
            
            <Heading level={3}>Pistes</Heading>
            {targetUserId && <TrackList userId={targetUserId} />}
          </Flex>
        </>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <Button onClick={() => setShowDebugInfo(!showDebugInfo)} marginTop="2rem" variation="link" size="small">
          {showDebugInfo ? 'Masquer les infos de débogage' : 'Afficher les infos de débogage'}
        </Button>
      )}
      
      {showDebugInfo && (
        <Card variation="outlined" marginTop="1rem">
          <Text fontWeight="bold">Informations de débogage</Text>
          <Text>ID utilisateur ciblé: {targetUserId || 'Non disponible'}</Text>
          <Text>ID utilisateur courant: {authUserId || 'Non disponible'}</Text>
          <Text>ID utilisateur URL: {urlUserId || 'Non disponible'}</Text>
          <Text>Est mon profil: {isOwnProfile ? 'Oui' : 'Non'}</Text>
          <Text>Pseudo: {profile.username || 'Non défini'}</Text>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', fontSize: '0.8rem' }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </Card>
      )}
    </View>
  );
};

export default Profile;