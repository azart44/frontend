import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Image, 
  Loader,
  View
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types/ProfileTypes';
import { FaInstagram, FaSoundcloud } from 'react-icons/fa';

// Chemin de l'image par défaut (dans le dossier public)
const DEFAULT_IMAGE_PATH = '/default-profile.jpg';

interface ProfileCardProps {
  profile: UserProfile;
  isPreview?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = React.memo(({ profile, isPreview = false }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Memoize the profile image source
  const profileImageSrc = useMemo(() => {
    // Si erreur détectée, utiliser l'image par défaut
    if (imageError) {
      return DEFAULT_IMAGE_PATH;
    }
    
    // Premier choix: l'URL présignée du serveur
    if (profile.profileImageUrl) {
      return profile.profileImageUrl;
    }
    
    // Deuxième choix: si nous avons des données base64
    if (profile.profileImageBase64) {
      return profile.profileImageBase64.startsWith('data:') 
        ? profile.profileImageBase64 
        : `data:image/jpeg;base64,${profile.profileImageBase64}`;
    }
    
    // Fallback: image par défaut
    return DEFAULT_IMAGE_PATH;
  }, [profile.profileImageUrl, profile.profileImageBase64, imageError]);
  
  // Optimiser le rendu conditionnel
  const renderSocialIcons = useMemo(() => {
    if (!profile.socialLinks) return null;
    
    return (
      <Flex marginTop="0.5rem" gap="0.5rem">
        {profile.socialLinks.instagram && (
          <FaInstagram 
            size={24} 
            onClick={() => window.open(profile.socialLinks?.instagram, '_blank')} 
            style={{ cursor: 'pointer' }} 
            aria-label="Instagram"
          />
        )}
        {profile.socialLinks.soundcloud && (
          <FaSoundcloud 
            size={24} 
            onClick={() => window.open(profile.socialLinks?.soundcloud, '_blank')} 
            style={{ cursor: 'pointer' }} 
            aria-label="SoundCloud"
          />
        )}
      </Flex>
    );
  }, [profile.socialLinks]);
  
  // Naviguer vers le profil complet si en mode prévisualisation
  const handleCardClick = () => {
    if (isPreview) {
      navigate(`/profile/${profile.userId}`);
    }
  };
  
  // Journaliser les erreurs d'image pour aider au débogage
  const handleImageError = () => {
    console.error('Erreur lors du chargement de l\'image de profil:', {
      profileImageUrl: profile.profileImageUrl,
      hasBase64: !!profile.profileImageBase64
    });
    setImageError(true);
    setImageLoading(false);
  };
  
  // Handler pour quand l'image est chargée
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  // Dimensions de l'image selon le mode
  const imageSize = isPreview ? "80px" : "150px";
  
  return (
    <Card 
      variation="elevated"
      padding={isPreview ? "1rem" : "2rem"}
      onClick={isPreview ? handleCardClick : undefined}
      style={isPreview ? { cursor: 'pointer' } : undefined}
    >
      <Flex direction="column" alignItems="center">
        {/* Conteneur d'image avec état de chargement */}
        <View position="relative" width={imageSize} height={imageSize}>
          {imageLoading && (
            <View 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0" 
              backgroundColor="rgba(0,0,0,0.05)"
              borderRadius="50%"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Loader size="small" />
            </View>
          )}
          <Image
            src={profileImageSrc}
            alt={`${profile.username || 'User'}'s profile`}
            width="100%"
            height="100%"
            style={{ 
              objectFit: 'cover', 
              borderRadius: '50%',
              display: imageLoading ? 'none' : 'block'
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </View>
        
        <Heading 
          level={isPreview ? 5 : 3} 
          marginTop="0.5rem"
        >
          {profile.username || 'Utilisateur'}
        </Heading>
        
        {!isPreview && <Text>{profile.email}</Text>}
        
        <Flex marginTop="0.5rem" gap="0.5rem">
          {profile.userType && <Badge variation="info">{profile.userType}</Badge>}
          {profile.experienceLevel && <Badge variation="success">{profile.experienceLevel}</Badge>}
        </Flex>
        
        {renderSocialIcons}
        
        {!isPreview && profile.bio && (
          <Text marginTop="1rem">{profile.bio}</Text>
        )}
      </Flex>
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';
export default ProfileCard;