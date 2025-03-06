import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { 
  Heading, 
  Text, 
  Button, 
  Flex,
  Loader,
  Alert,
  Image,
  Badge,
  Divider,
  View
} from '@aws-amplify/ui-react';
import { useUserProfile } from '../../hooks/useProfile';
import EditProfileForm from './EditProfileForm';
import ProfileCollection from './ProfileCollection'; // Importation du nouveau composant
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
  FaInstagram,
  FaYoutube,
  FaSoundcloud,
  FaTwitter,
  FaEllipsisH
} from 'react-icons/fa';
import { 
  useFollowStatus, 
  useFollowCounts, 
  useFollowUser, 
  useUnfollowUser 
} from '../../hooks/useFollow';
import FollowModal from '../follow/FollowModal';

/**
 * Composant d'affichage d'un profil utilisateur (thème sombre)
 */
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const { isAuthenticated, userId: authUserId } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('collection'); // Changement de l'onglet par défaut à 'collection'
  const [imageError, setImageError] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers');

  // ID de l'utilisateur ciblé
  const targetUserId = urlUserId || authUserId;

  // Récupération du profil utilisateur
  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useUserProfile(targetUserId);

  // Hooks de suivi
  const { 
    data: followStatus, 
    isLoading: isFollowStatusLoading 
  } = useFollowStatus(targetUserId);
  
  const { 
    data: followCounts, 
    isLoading: isFollowCountsLoading,
    refetch: refetchFollowCounts // Ajouter cette référence
  } = useFollowCounts(targetUserId);
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Détermine si c'est le propre profil de l'utilisateur
  const isOwnProfile = useMemo(() => {
    return !urlUserId || urlUserId === authUserId;
  }, [urlUserId, authUserId]);

  // Extraire les données de suivi
  const isFollowing = followStatus?.isFollowing || false;
  const followersCount = followCounts?.followersCount || 0;
  const followingCount = followCounts?.followingCount || 0;

  // Gestion de la mise à jour du profil
  const handleProfileUpdate = async () => {
    await refetchProfile();
    setIsEditing(false);
  };

  // Gestion du suivi/désabonnement
  const handleFollowToggle = () => {
    if (!isAuthenticated || !targetUserId) {
      navigate('/auth');
      return;
    }
    
    if (isFollowing) {
      unfollowMutation.mutate(targetUserId);
    } else {
      followMutation.mutate(targetUserId);
    }
  };

  // Affichage du loader pendant le chargement
  if (isProfileLoading || isFollowStatusLoading || isFollowCountsLoading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  // Gestion des erreurs
  if (profileError) {
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
          <Button onClick={() => refetchProfile()} variation="link">
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

  // Couleur d'arrière-plan générée en fonction du nom d'utilisateur
  const generateBgColor = (username: string) => {
    const colors = [
      'linear-gradient(45deg, #8e2de2, #4a00e0)',
      'linear-gradient(45deg, #1e3c72, #2a5298)',
      'linear-gradient(45deg, #ff512f, #dd2476)',
      'linear-gradient(45deg, #834d9b, #d04ed6)',
      'linear-gradient(45deg, #11998e, #38ef7d)'
    ];
    
    // Utiliser le username pour sélectionner une couleur
    const hash = username?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  return (
    <View>
      {/* Bannière de profil */}
      <div 
        style={{ 
          height: '180px', 
          background: generateBgColor(profile.username || 'user'),
          borderRadius: '8px 8px 0 0',
          position: 'relative'
        }}
      ></div>
      
      {/* Informations du profil */}
      <div style={{ 
        backgroundColor: 'var(--chordora-card-bg)',
        padding: '1.5rem',
        borderRadius: '0 0 8px 8px',
        marginTop: '-60px',
        position: 'relative',
        zIndex: 1
      }}>
        <Flex direction={{ base: 'column', medium: 'row' }} alignItems="flex-start" gap="2rem">
          {/* Image de profil */}
          <Image
            src={profileImageSrc}
            alt={`${profile.username || 'Utilisateur'} profile`}
            width="120px"
            height="120px"
            style={{ 
              objectFit: 'cover',
              borderRadius: '50%',
              border: '4px solid var(--chordora-card-bg)',
              marginTop: '-60px'
            }}
            onError={() => setImageError(true)}
          />
          
          {/* Informations principales */}
          <Flex direction="column" gap="0.5rem" flex="1">
            <Flex justifyContent="space-between" alignItems="flex-start">
              <Heading level={2}>
                {profile.username || `User_${profile.userId?.substring(0, 6)}`}
              </Heading>
              
              {/* Boutons d'action */}
              <Flex gap="1rem">
                {isOwnProfile ? (
                  <>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variation="menu"
                      style={{ 
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <FaEdit style={{ marginRight: '0.5rem' }} />
                      Modifier
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/account-settings')}
                      variation="menu"
                      style={{ 
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <FaCog style={{ marginRight: '0.5rem' }} />
                      Paramètres
                    </Button>
                  </>
                ) : isAuthenticated && (
                  <>
                    <Button 
                      onClick={() => {/* Fonction de message */}}
                      variation="menu"
                      style={{ 
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Message
                    </Button>
                    
                    <Button
                      onClick={handleFollowToggle}
                      isLoading={followMutation.isPending || unfollowMutation.isPending}
                      variation={isFollowing ? "menu" : "primary"}
                      style={{ 
                        borderRadius: '20px',
                        backgroundColor: isFollowing ? 'rgba(255, 255, 255, 0.1)' : 'var(--chordora-primary)'
                      }}
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
                    
                    <Button
                      variation="menu"
                      style={{ 
                        borderRadius: '20px',
                        width: '40px',
                        height: '40px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <FaEllipsisH />
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
            
            <Flex gap="0.5rem" wrap="wrap">
              {profile.userType && (
                <Badge variation="info">{profile.userType}</Badge>
              )}
              {profile.experienceLevel && (
                <Badge variation="success">{profile.experienceLevel}</Badge>
              )}
            </Flex>
            
            {/* Bio */}
            {profile.bio && (
              <Text style={{ marginTop: '0.75rem', maxWidth: '800px' }}>
                {profile.bio}
              </Text>
            )}
            
            {/* Stats de followers */}
            <Flex marginTop="1rem" gap="1.5rem">
              <Text 
                fontWeight="bold" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setModalTab('followers');
                  setShowFollowModal(true);
                }}
              >
                <span style={{ color: 'var(--chordora-text-primary)' }}>{followersCount}</span>
                <span style={{ marginLeft: '4px', color: 'var(--chordora-text-secondary)' }}>
                  {followersCount === 1 ? 'abonné' : 'abonnés'}
                </span>
              </Text>
              
              <Text 
                fontWeight="bold"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setModalTab('following');
                  setShowFollowModal(true);
                }}
              >
                <span style={{ color: 'var(--chordora-text-primary)' }}>{followingCount}</span>
                <span style={{ marginLeft: '4px', color: 'var(--chordora-text-secondary)' }}>
                  abonnements
                </span>
              </Text>
              
              {profile.location && (
                <Flex alignItems="center" gap="0.5rem">
                  <FaMapMarkerAlt color="var(--chordora-text-secondary)" size={14} />
                  <Text color="var(--chordora-text-secondary)">{profile.location}</Text>
                </Flex>
              )}
            </Flex>
            
            {/* Réseaux sociaux */}
            {profile.socialLinks && Object.values(profile.socialLinks).some(link => link) && (
              <Flex gap="1rem" marginTop="1rem">
                {profile.socialLinks.instagram && (
                  <a 
                    href={profile.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--chordora-text-secondary)' }}
                  >
                    <FaInstagram size={20} />
                  </a>
                )}
                {profile.socialLinks.soundcloud && (
                  <a 
                    href={profile.socialLinks.soundcloud} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--chordora-text-secondary)' }}
                  >
                    <FaSoundcloud size={20} />
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a 
                    href={profile.socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--chordora-text-secondary)' }}
                  >
                    <FaYoutube size={20} />
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a 
                    href={profile.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--chordora-text-secondary)' }}
                  >
                    <FaTwitter size={20} />
                  </a>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
      </div>
      
      {/* Onglets du profil */}
      <Flex 
        style={{ borderBottom: "1px solid var(--chordora-divider)" }} 
        marginTop="2rem" 
        marginBottom="2rem"
      >

        <button
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '1rem 1.5rem',
            cursor: 'pointer',
            color: activeTab === 'about' ? 'var(--chordora-primary)' : 'var(--chordora-text-secondary)',
            fontWeight: activeTab === 'about' ? 'bold' : 'normal',
            borderBottom: activeTab === 'about' ? '2px solid var(--chordora-primary)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          À propos
        </button>
        <button
          className={`tab-button ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '1rem 1.5rem',
            cursor: 'pointer',
            color: activeTab === 'collection' ? 'var(--chordora-primary)' : 'var(--chordora-text-secondary)',
            fontWeight: activeTab === 'collection' ? 'bold' : 'normal',
            borderBottom: activeTab === 'collection' ? '2px solid var(--chordora-primary)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <FaMusic style={{ marginRight: '0.5rem' }} />
          Collection
        </button>
      </Flex>
      
      {/* Contenu des onglets */}
      {activeTab === 'collection' && (
        <ProfileCollection 
          userId={targetUserId!} 
          isOwnProfile={isOwnProfile} 
        />
      )}
      
      {activeTab === 'about' && (
        <div style={{ backgroundColor: 'var(--chordora-card-bg)', padding: '1.5rem', borderRadius: '8px' }}>
          <Heading level={3} marginBottom="1.5rem">À propos</Heading>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Genres musicaux */}
            {((profile.musicGenres && profile.musicGenres.length > 0) || profile.musicGenre) && (
              <div>
                <Flex alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                  <FaMusic size={16} color="var(--chordora-text-secondary)" />
                  <Heading level={5}>Genres musicaux</Heading>
                </Flex>
                <Flex gap="0.5rem" wrap="wrap">
                  {profile.musicGenres && profile.musicGenres.map(genre => (
                    <Badge key={genre} variation="info">{genre}</Badge>
                  ))}
                  {profile.musicGenre && !profile.musicGenres?.includes(profile.musicGenre) && (
                    <Badge variation="info">{profile.musicGenre}</Badge>
                  )}
                </Flex>
              </div>
            )}
            
            {/* Mood musical */}
            {profile.musicalMood && (
              <div>
                <Heading level={5} marginBottom="0.5rem">Mood musical</Heading>
                <Text>{profile.musicalMood}</Text>
              </div>
            )}
            
            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div>
                <Flex alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                  <FaTag size={16} color="var(--chordora-text-secondary)" />
                  <Heading level={5}>Tags</Heading>
                </Flex>
                <Flex gap="0.5rem" wrap="wrap">
                  {profile.tags.map(tag => (
                    <Badge key={tag} variation="warning">{tag}</Badge>
                  ))}
                </Flex>
              </div>
            )}
            
            {/* Équipement */}
            {profile.equipment && profile.equipment.length > 0 && (
              <div>
                <Flex alignItems="center" gap="0.5rem" marginBottom="0.5rem">
                  <FaToolbox size={16} color="var(--chordora-text-secondary)" />
                  <Heading level={5}>Équipement</Heading>
                </Flex>
                <Flex gap="0.5rem" wrap="wrap">
                  {profile.equipment.map(item => (
                    <Badge key={item} variation="info">{item}</Badge>
                  ))}
                </Flex>
              </div>
            )}
            
            {/* Logiciel */}
            {profile.software && (
              <div>
                <Heading level={5} marginBottom="0.5rem">Logiciel principal</Heading>
                <Text>{profile.software}</Text>
              </div>
            )}
          </div>
          
          {/* Artistes favoris */}
          {profile.favoriteArtists && profile.favoriteArtists.some(artist => artist) && (
            <>
              <Divider marginTop="2rem" marginBottom="1.5rem" />
              <Heading level={5} marginBottom="0.5rem">Artistes favoris</Heading>
              <Text>
                {profile.favoriteArtists.filter(Boolean).join(', ')}
              </Text>
            </>
          )}
        </div>
      )}
      
      {/* Modal pour afficher les followers/following */}
      {showFollowModal && targetUserId && (
  <FollowModal
    userId={targetUserId}
    isOpen={showFollowModal}
    onClose={() => setShowFollowModal(false)}
    initialTab={modalTab}
    username={profile?.username || 'Utilisateur'}
    onFollowStateChange={() => refetchFollowCounts()} // Ajouter cette prop
  />
)}
    </View>
  );
};

export default Profile;