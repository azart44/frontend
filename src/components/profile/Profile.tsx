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
  Alert,
  Image,
  Badge,
  Divider,
} from '@aws-amplify/ui-react';
import { useUserProfile } from '../../hooks/useProfile';
import EditProfileForm from './EditProfileForm';
import TrackList from '../track/TrackList';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaEdit, 
  FaMapMarkerAlt, 
  FaToolbox, 
  FaMusic, 
  FaTag, 
  FaCog,
  FaUserPlus,
  FaUserCheck,
} from 'react-icons/fa';
import { followUser, unfollowUser, getFollowStatus, getFollowCounts } from '../../api/follow';
import FollowModal from '../follow/FollowModal';

/**
 * Composant d'affichage d'un profil utilisateur
 * Gère à la fois l'affichage du profil personnel et des profils d'autres utilisateurs
 */
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const { isAuthenticated, userId: authUserId } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [imageError, setImageError] = useState(false);

  // États pour la gestion des followers/following
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers');

  // ID de l'utilisateur ciblé (celui de l'URL ou l'utilisateur authentifié)
  const targetUserId = urlUserId || authUserId;

  // Récupération du profil utilisateur
  const { 
    data: profile, 
    isLoading, 
    error,
    refetch
  } = useUserProfile(targetUserId);

  // Détermine si c'est le propre profil de l'utilisateur
  const isOwnProfile = useMemo(() => {
    return !urlUserId || urlUserId === authUserId;
  }, [urlUserId, authUserId]);

  // Gestion de la mise à jour du profil
  const handleProfileUpdate = async () => {
    await refetch();
    setIsEditing(false);
  };

  // Charger les données de suivi
  useEffect(() => {
    const loadFollowData = async () => {
      if (!targetUserId) return;
      
      try {
        // Charger les compteurs
        const countsResponse = await getFollowCounts(targetUserId);
        if (countsResponse && countsResponse.data) {
          setFollowersCount(countsResponse.data.followersCount || 0);
          setFollowingCount(countsResponse.data.followingCount || 0);
        }
        
        // Vérifier si l'utilisateur connecté suit cet utilisateur
        if (isAuthenticated && !isOwnProfile && authUserId) {
          const statusResponse = await getFollowStatus(targetUserId);
          if (statusResponse && statusResponse.data) {
            setIsFollowing(statusResponse.data.isFollowing || false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de suivi:', error);
      }
    };
    
    loadFollowData();
  }, [targetUserId, isAuthenticated, isOwnProfile, authUserId]);

  // Gestion du suivi/désabonnement
  const handleFollowToggle = async () => {
    if (!isAuthenticated || !targetUserId) {
      navigate('/auth');
      return;
    }
    
    setIsFollowLoading(true);
    
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut de suivi:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Logging à des fins de débogage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile component - Auth state:', { isAuthenticated, authUserId });
      console.log('Profile component - Target userId:', targetUserId);
      console.log('Profile component - URL userId:', urlUserId);
      console.log('Profile component - Is own profile:', isOwnProfile);
      console.log('Profile component - Profile data:', profile);
    }
  }, [isAuthenticated, authUserId, targetUserId, urlUserId, profile, isOwnProfile]);

  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <View padding="2rem" textAlign="center">
        <Loader size="large" />
        <Text textAlign="center" marginTop="1rem">Chargement du profil...</Text>
      </View>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <View padding="2rem">
        <Alert variation="error" heading="Erreur">
          Une erreur est survenue lors du chargement du profil.
        </Alert>
        
        <Button onClick={() => navigate(-1)} marginTop="1rem">
          Retour
        </Button>
      </View>
    );
  }

  // Redirection vers le formulaire de complétion de profil si nécessaire
  if (!profile && isOwnProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Gestion du cas où le profil n'existe pas
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

  // Si en mode édition, afficher le formulaire d'édition
  if (isEditing) {
    return (
      <EditProfileForm 
        userProfile={profile} 
        onCancel={() => setIsEditing(false)}
        onSuccess={handleProfileUpdate}
      />
    );
  }

  // URL de l'image de profil avec gestion d'erreur
  const profileImageSrc = imageError || !profile.profileImageUrl 
    ? '/default-profile.jpg' 
    : profile.profileImageUrl;

  // Affichage du profil
  return (
    <View padding="2rem">
      <Flex direction="column" gap="2rem">
        {/* En-tête du profil */}
        <Card padding="2rem">
          <Flex direction={{ base: 'column', medium: 'row' }} gap="2rem" alignItems="center">
            {/* Image de profil */}
            <Image
              src={profileImageSrc}
              alt={`${profile.username || 'Utilisateur'} profile`}
              width="150px"
              height="150px"
              style={{ 
                objectFit: 'cover',
                borderRadius: '50%' 
              }}
              onError={() => setImageError(true)}
            />
            
            {/* Informations principales */}
            <Flex direction="column" flex="1" gap="0.5rem">
              <Heading level={2}>
                {profile.username || `User_${profile.userId?.substring(0, 6)}`}
              </Heading>
              
              <Flex gap="0.5rem" wrap="wrap">
                {profile.userType && (
                  <Badge variation="info">{profile.userType}</Badge>
                )}
                {profile.experienceLevel && (
                  <Badge variation="success">{profile.experienceLevel}</Badge>
                )}
              </Flex>
              
              {/* Statistiques de followers et suivis */}
              <Flex marginTop="1rem" gap="1.5rem">
                <Button
                  onClick={() => {
                    setModalTab('followers');
                    setShowFollowModal(true);
                  }}
                  variation="link"
                  padding="0"
                >
                  <Text fontWeight="bold">{followersCount}</Text>
                  <Text marginLeft="0.25rem" color="gray">
                    {followersCount === 1 ? 'abonné' : 'abonnés'}
                  </Text>
                </Button>
                
                <Button
                  onClick={() => {
                    setModalTab('following');
                    setShowFollowModal(true);
                  }}
                  variation="link"
                  padding="0"
                >
                  <Text fontWeight="bold">{followingCount}</Text>
                  <Text marginLeft="0.25rem" color="gray">
                    abonnements
                  </Text>
                </Button>
              </Flex>
              
              {profile.bio && (
                <Text marginTop="0.5rem">
                  {profile.bio}
                </Text>
              )}
              
              {profile.location && (
                <Flex alignItems="center" gap="0.5rem" marginTop="0.5rem">
                  <FaMapMarkerAlt size={14} />
                  <Text>{profile.location}</Text>
                </Flex>
              )}
              
              {/* Tags */}
              {profile.tags && profile.tags.length > 0 && (
                <Flex gap="0.5rem" wrap="wrap" marginTop="0.5rem" alignItems="center">
                  <FaTag size={14} />
                  {profile.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variation="warning"
                      size="small"
                    >
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Flex>
            
            {/* Bouton d'édition (pour son profil) ou bouton de suivi (pour les autres profils) */}
            <Flex direction="column" gap="0.5rem">
              {isOwnProfile ? (
                <>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variation="primary"
                    size="small"
                  >
                    <FaEdit style={{ marginRight: '0.5rem' }} />
                    Modifier mon profil
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/account-settings')}
                    variation="link"
                    size="small"
                  >
                    <FaCog style={{ marginRight: '0.5rem' }} />
                    Paramètres du compte
                  </Button>
                </>
              ) : isAuthenticated && (
                <Button
                  onClick={handleFollowToggle}
                  isLoading={isFollowLoading}
                  loadingText={isFollowing ? "Désabonnement..." : "Abonnement..."}
                  variation={isFollowing ? "link" : "primary"}
                >
                  {isFollowing ? (
                    <>
                      <FaUserCheck style={{ marginRight: '0.5rem' }} />
                      Abonné
                    </>
                  ) : (
                    <>
                      <FaUserPlus style={{ marginRight: '0.5rem' }} />
                      Suivre
                    </>
                  )}
                </Button>
              )}
            </Flex>
          </Flex>
        </Card>
        
        {/* Informations supplémentaires */}
        <Card padding="1.5rem">
          <Heading level={4} marginBottom="1rem">Détails musicaux</Heading>
          
          <Flex gap="2rem" wrap="wrap">
            {/* Genres musicaux */}
            {((profile.musicGenres && profile.musicGenres.length > 0) || profile.musicGenre) && (
              <View>
                <Flex alignItems="center" gap="0.5rem">
                  <FaMusic size={16} />
                  <Heading level={5}>Genres musicaux</Heading>
                </Flex>
                <Flex gap="0.5rem" marginTop="0.5rem" wrap="wrap">
                  {profile.musicGenres && profile.musicGenres.map(genre => (
                    <Badge key={genre} variation="info">{genre}</Badge>
                  ))}
                  {profile.musicGenre && !profile.musicGenres?.includes(profile.musicGenre) && (
                    <Badge variation="info">{profile.musicGenre}</Badge>
                  )}
                </Flex>
              </View>
            )}
            
            {/* Mood musical */}
            {profile.musicalMood && (
              <View>
                <Heading level={5}>Mood musical</Heading>
                <Text marginTop="0.5rem">{profile.musicalMood}</Text>
              </View>
            )}
            
            {/* Équipement */}
            {profile.equipment && profile.equipment.length > 0 && (
              <View>
                <Flex alignItems="center" gap="0.5rem">
                  <FaToolbox size={16} />
                  <Heading level={5}>Équipement</Heading>
                </Flex>
                <Flex gap="0.5rem" marginTop="0.5rem" wrap="wrap">
                  {profile.equipment.map(item => (
                    <Badge key={item} variation="warning">{item}</Badge>
                  ))}
                </Flex>
              </View>
            )}
            
            {/* Logiciel */}
            {profile.software && (
              <View>
                <Heading level={5}>Logiciel principal</Heading>
                <Text marginTop="0.5rem">{profile.software}</Text>
              </View>
            )}
          </Flex>
          
          {/* Artistes favoris */}
          {profile.favoriteArtists && profile.favoriteArtists.some(artist => artist) && (
            <>
              <Divider marginTop="1.5rem" marginBottom="1.5rem" />
              <Heading level={5}>Artistes favoris</Heading>
              <Text marginTop="0.5rem">
                {profile.favoriteArtists.filter(Boolean).join(', ')}
              </Text>
            </>
          )}
          
          {/* Réseaux sociaux */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
            <>
              <Divider marginTop="1.5rem" marginBottom="1.5rem" />
              <Heading level={5}>Réseaux sociaux</Heading>
              <Flex gap="1rem" marginTop="0.5rem" wrap="wrap">
                {profile.socialLinks.instagram && (
                  <Button
                    as="a"
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    variation="link"
                  >
                    Instagram
                  </Button>
                )}
                {profile.socialLinks.soundcloud && (
                  <Button
                    as="a"
                    href={profile.socialLinks.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    variation="link"
                  >
                    SoundCloud
                  </Button>
                )}
                {profile.socialLinks.youtube && (
                  <Button
                    as="a"
                    href={profile.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    variation="link"
                  >
                    YouTube
                  </Button>
                )}
                {profile.socialLinks.twitter && (
                  <Button
                    as="a"
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    variation="link"
                  >
                    Twitter
                  </Button>
                )}
              </Flex>
            </>
          )}
        </Card>
        
        {/* Pistes audio de l'utilisateur */}
        <View>
          <Heading level={3} marginBottom="1rem">Pistes</Heading>
          {targetUserId && <TrackList userId={targetUserId} />}
        </View>
        
        {/* Information de débogage (uniquement en développement) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Button 
              onClick={() => setShowDebugInfo(!showDebugInfo)} 
              marginTop="2rem" 
              variation="link" 
              size="small"
            >
              {showDebugInfo ? 'Masquer les infos de débogage' : 'Afficher les infos de débogage'}
            </Button>
            
            {showDebugInfo && (
              <Card variation="outlined" marginTop="1rem">
                <Text fontWeight="bold">Informations de débogage</Text>
                <Text>ID utilisateur ciblé: {targetUserId || 'Non disponible'}</Text>
                <Text>ID utilisateur courant: {authUserId || 'Non disponible'}</Text>
                <Text>ID utilisateur URL: {urlUserId || 'Non disponible'}</Text>
                <Text>Est mon profil: {isOwnProfile ? 'Oui' : 'Non'}</Text>
                <Text>Est en train de suivre: {isFollowing ? 'Oui' : 'Non'}</Text>
                <Text>Nombre de followers: {followersCount}</Text>
                <Text>Nombre d'abonnements: {followingCount}</Text>
                <Text>Pseudo: {profile.username || 'Non défini'}</Text>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  overflow: 'auto', 
                  fontSize: '0.8rem',
                  background: '#f0f0f0',
                  padding: '1rem',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </Card>
            )}
          </>
        )}
      </Flex>
      
      {/* Modal pour afficher les followers/following */}
      {showFollowModal && targetUserId && (
        <FollowModal
          userId={targetUserId}
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
          initialTab={modalTab}
          username={profile?.username || 'Utilisateur'}
        />
      )}
    </View>
  );
};

export default Profile;