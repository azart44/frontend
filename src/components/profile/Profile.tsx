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
    console.log('Profile component - Profile data:', profile);
  }, [isAuthenticated, authUserId, targetUserId, urlUserId, profile]);

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

  // Si profil non trouvé pour l'utilisateur courant, rediriger vers CompleteProfile
  if (!profile && isOwnProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Si profil non trouvé (pour un autre utilisateur)
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
            {/* En-tête du profil avec pseudo */}
            <Heading level={2} textAlign="center">
              {profile.username ? profile.username : 'Profil Utilisateur'}
            </Heading>
            
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
      
      {/* Afficher infos de débogage en mode développement */}
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